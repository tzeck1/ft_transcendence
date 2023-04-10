import EventEmitter from 'events';
import { ClientState, getMessageBytes, Protocol } from '@colyseus/core';
import { Schema } from '@colyseus/schema';

class uWebSocketWrapper extends EventEmitter {
    ws;
    constructor(ws) {
        super();
        this.ws = ws;
    }
}
var ReadyState;
(function (ReadyState) {
    ReadyState[ReadyState["CONNECTING"] = 0] = "CONNECTING";
    ReadyState[ReadyState["OPEN"] = 1] = "OPEN";
    ReadyState[ReadyState["CLOSING"] = 2] = "CLOSING";
    ReadyState[ReadyState["CLOSED"] = 3] = "CLOSED";
})(ReadyState || (ReadyState = {}));
class uWebSocketClient {
    id;
    _ref;
    sessionId;
    state = ClientState.JOINING;
    _enqueuedMessages = [];
    _afterNextPatchQueue;
    readyState = ReadyState.OPEN;
    constructor(id, _ref) {
        this.id = id;
        this._ref = _ref;
        this.sessionId = id;
        _ref.on('close', () => this.readyState = ReadyState.CLOSED);
    }
    get ref() { return this._ref; }
    set ref(_ref) {
        this._ref = _ref;
        this.readyState = ReadyState.OPEN;
    }
    send(messageOrType, messageOrOptions, options) {
        this.enqueueRaw((messageOrType instanceof Schema)
            ? getMessageBytes[Protocol.ROOM_DATA_SCHEMA](messageOrType)
            : getMessageBytes[Protocol.ROOM_DATA](messageOrType, messageOrOptions), options);
    }
    enqueueRaw(data, options) {
        // use room's afterNextPatch queue
        if (options?.afterNextPatch) {
            this._afterNextPatchQueue.push([this, arguments]);
            return;
        }
        if (this.state === ClientState.JOINING) {
            // sending messages during `onJoin`.
            // - the client-side cannot register "onMessage" callbacks at this point.
            // - enqueue the messages to be send after JOIN_ROOM message has been sent
            this._enqueuedMessages.push(data);
            return;
        }
        this.raw(data, options);
    }
    raw(data, options, cb) {
        if (this.readyState !== ReadyState.OPEN) {
            console.warn('trying to send data to inactive client', this.sessionId);
            return;
        }
        this._ref.ws.send(new Uint8Array(data), true, false);
    }
    error(code, message = '', cb) {
        this.raw(getMessageBytes[Protocol.ERROR](code, message), undefined, cb);
    }
    leave(code, data) {
        if (this.readyState !== ReadyState.OPEN) {
            // connection already closed. ignore.
            return;
        }
        this.readyState = ReadyState.CLOSING;
        if (code !== undefined) {
            this._ref.ws.end(code, data);
        }
        else {
            this._ref.ws.close();
        }
    }
    close(code, data) {
        console.warn('DEPRECATION WARNING: use client.leave() instead of client.close()');
        try {
            throw new Error();
        }
        catch (e) {
            console.log(e.stack);
        }
        this.leave(code, data);
    }
    toJSON() {
        return { sessionId: this.sessionId, readyState: this.readyState };
    }
}

export { ReadyState, uWebSocketClient, uWebSocketWrapper };
//# sourceMappingURL=uWebSocketClient.mjs.map
