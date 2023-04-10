import querystring from 'querystring';
import uWebSockets from 'uWebSockets.js';
import { Transport, DummyServer, spliceOne, matchMaker, debugAndPrintError, ErrorCode } from '@colyseus/core';
import { uWebSocketClient, uWebSocketWrapper } from './uWebSocketClient.mjs';

class uWebSocketsTransport extends Transport {
    app;
    clients = [];
    clientWrappers = new WeakMap();
    _listeningSocket;
    constructor(options = {}, appOptions = {}) {
        super();
        this.app = (appOptions.cert_file_name && appOptions.key_file_name)
            ? uWebSockets.SSLApp(appOptions)
            : uWebSockets.App(appOptions);
        if (!options.maxBackpressure) {
            options.maxBackpressure = 1024 * 1024;
        }
        if (!options.compression) {
            options.compression = uWebSockets.DISABLED;
        }
        if (!options.maxPayloadLength) {
            options.maxPayloadLength = 1024 * 1024;
        }
        // https://github.com/colyseus/colyseus/issues/458
        // Adding a mock object for Transport.server
        if (!this.server) {
            this.server = new DummyServer();
        }
        this.app.ws('/*', {
            ...options,
            upgrade: (res, req, context) => {
                // get all headers
                const headers = {};
                req.forEach((key, value) => headers[key] = value);
                /* This immediately calls open handler, you must not use res after this call */
                /* Spell these correctly */
                res.upgrade({
                    url: req.getUrl(),
                    query: req.getQuery(),
                    // compatibility with @colyseus/ws-transport
                    headers,
                    connection: {
                        remoteAddress: Buffer.from(res.getRemoteAddressAsText()).toString()
                    }
                }, req.getHeader('sec-websocket-key'), req.getHeader('sec-websocket-protocol'), req.getHeader('sec-websocket-extensions'), context);
            },
            open: async (ws) => {
                // ws.pingCount = 0;
                await this.onConnection(ws);
            },
            // pong: (ws: RawWebSocketClient) => {
            //     ws.pingCount = 0;
            // },
            close: (ws, code, message) => {
                // remove from client list
                spliceOne(this.clients, this.clients.indexOf(ws));
                const clientWrapper = this.clientWrappers.get(ws);
                if (clientWrapper) {
                    this.clientWrappers.delete(ws);
                    // emit 'close' on wrapper
                    clientWrapper.emit('close', code);
                }
            },
            message: (ws, message, isBinary) => {
                // emit 'close' on wrapper
                this.clientWrappers.get(ws)?.emit('message', Buffer.from(message.slice(0)));
            },
        });
        this.registerMatchMakeRequest();
    }
    listen(port, hostname, backlog, listeningListener) {
        this.app.listen(port, (listeningSocket) => {
            this._listeningSocket = listeningSocket;
            listeningListener?.();
            this.server.emit("listening"); // Mocking Transport.server behaviour, https://github.com/colyseus/colyseus/issues/458
        });
        return this;
    }
    shutdown() {
        if (this._listeningSocket) {
            uWebSockets.us_listen_socket_close(this._listeningSocket);
            this.server.emit("close"); // Mocking Transport.server behaviour, https://github.com/colyseus/colyseus/issues/458
        }
    }
    simulateLatency(milliseconds) {
        const originalRawSend = uWebSocketClient.prototype.raw;
        uWebSocketClient.prototype.raw = function () {
            setTimeout(() => originalRawSend.apply(this, arguments), milliseconds);
        };
    }
    async onConnection(rawClient) {
        const wrapper = new uWebSocketWrapper(rawClient);
        // keep reference to client and its wrapper
        this.clients.push(rawClient);
        this.clientWrappers.set(rawClient, wrapper);
        const query = rawClient.query;
        const url = rawClient.url;
        const sessionId = querystring.parse(query).sessionId;
        const processAndRoomId = url.match(/\/[a-zA-Z0-9_\-]+\/([a-zA-Z0-9_\-]+)$/);
        const roomId = processAndRoomId && processAndRoomId[1];
        const room = matchMaker.getRoomById(roomId);
        const client = new uWebSocketClient(sessionId, wrapper);
        //
        // TODO: DRY code below with all transports
        //
        try {
            if (!room || !room.hasReservedSeat(sessionId)) {
                throw new Error('seat reservation expired.');
            }
            await room._onJoin(client, rawClient);
        }
        catch (e) {
            debugAndPrintError(e);
            // send error code to client then terminate
            client.error(e.code, e.message, () => rawClient.close());
        }
    }
    registerMatchMakeRequest() {
        const headers = {
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
            'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Max-Age': 2592000,
            // ...
        };
        // TODO: DRY with Server.ts
        const matchmakeRoute = 'matchmake';
        const allowedRoomNameChars = /([a-zA-Z_\-0-9]+)/gi;
        const writeHeaders = (res) => {
            // skip if aborted
            if (res.aborted) {
                return;
            }
            for (const header in headers) {
                res.writeHeader(header, headers[header].toString());
            }
            return true;
        };
        const writeError = (res, error) => {
            // skip if aborted
            if (res.aborted) {
                return;
            }
            res.writeStatus("406 Not Acceptable");
            res.end(JSON.stringify(error));
        };
        const onAborted = (res) => {
            res.aborted = true;
        };
        this.app.options("/matchmake/*", (res, req) => {
            res.onAborted(() => onAborted(res));
            if (writeHeaders(res)) {
                res.writeStatus("204 No Content");
                res.end();
            }
        });
        this.app.post("/matchmake/*", (res, req) => {
            res.onAborted(() => onAborted(res));
            writeHeaders(res);
            res.writeHeader('Content-Type', 'application/json');
            const url = req.getUrl();
            const matchedParams = url.match(allowedRoomNameChars);
            const matchmakeIndex = matchedParams.indexOf(matchmakeRoute);
            // read json body
            this.readJson(res, async (clientOptions) => {
                try {
                    if (clientOptions === undefined) {
                        throw new Error("invalid JSON input");
                    }
                    const method = matchedParams[matchmakeIndex + 1];
                    const name = matchedParams[matchmakeIndex + 2] || '';
                    const response = await matchMaker.controller.invokeMethod(method, name, clientOptions);
                    if (!res.aborted) {
                        res.writeStatus("200 OK");
                        res.end(JSON.stringify(response));
                    }
                }
                catch (e) {
                    debugAndPrintError(e);
                    writeError(res, {
                        code: e.code || ErrorCode.MATCHMAKE_UNHANDLED,
                        error: e.message
                    });
                }
            });
        });
        // this.app.any("/*", (res, req) => {
        //     res.onAborted(() => onAborted(req));
        //     res.writeStatus("200 OK");
        // });
        this.app.get("/matchmake/*", async (res, req) => {
            res.onAborted(() => onAborted(res));
            writeHeaders(res);
            res.writeHeader('Content-Type', 'application/json');
            const url = req.getUrl();
            const matchedParams = url.match(allowedRoomNameChars);
            const roomName = matchedParams.length > 1 ? matchedParams[matchedParams.length - 1] : "";
            try {
                const response = await matchMaker.controller.getAvailableRooms(roomName || '');
                if (!res.aborted) {
                    res.writeStatus("200 OK");
                    res.end(JSON.stringify(response));
                }
            }
            catch (e) {
                debugAndPrintError(e);
                writeError(res, {
                    code: e.code || ErrorCode.MATCHMAKE_UNHANDLED,
                    error: e.message
                });
            }
        });
    }
    /* Helper function for reading a posted JSON body */
    /* Extracted from https://github.com/uNetworking/uWebSockets.js/blob/master/examples/JsonPost.js */
    readJson(res, cb) {
        let buffer;
        /* Register data cb */
        res.onData((ab, isLast) => {
            let chunk = Buffer.from(ab);
            if (isLast) {
                let json;
                if (buffer) {
                    try {
                        // @ts-ignore
                        json = JSON.parse(Buffer.concat([buffer, chunk]));
                    }
                    catch (e) {
                        /* res.close calls onAborted */
                        // res.close();
                        cb(undefined);
                        return;
                    }
                    cb(json);
                }
                else {
                    try {
                        // @ts-ignore
                        json = JSON.parse(chunk);
                    }
                    catch (e) {
                        /* res.close calls onAborted */
                        // res.close();
                        cb(undefined);
                        return;
                    }
                    cb(json);
                }
            }
            else {
                if (buffer) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                else {
                    buffer = Buffer.concat([chunk]);
                }
            }
        });
    }
}

export { uWebSocketsTransport };
//# sourceMappingURL=uWebSocketsTransport.mjs.map
