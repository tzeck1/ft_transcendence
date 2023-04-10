'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var EventEmitter = require('events');
var core = require('@colyseus/core');
var schema = require('@colyseus/schema');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var EventEmitter__default = /*#__PURE__*/_interopDefaultLegacy(EventEmitter);

class uWebSocketWrapper extends EventEmitter__default['default'] {
    ws;
    constructor(ws) {
        super();
        this.ws = ws;
    }
}
exports.ReadyState = void 0;
(function (ReadyState) {
    ReadyState[ReadyState["CONNECTING"] = 0] = "CONNECTING";
    ReadyState[ReadyState["OPEN"] = 1] = "OPEN";
    ReadyState[ReadyState["CLOSING"] = 2] = "CLOSING";
    ReadyState[ReadyState["CLOSED"] = 3] = "CLOSED";
})(exports.ReadyState || (exports.ReadyState = {}));
class uWebSocketClient {
    id;
    _ref;
    sessionId;
    state = core.ClientState.JOINING;
    _enqueuedMessages = [];
    _afterNextPatchQueue;
    readyState = exports.ReadyState.OPEN;
    constructor(id, _ref) {
        this.id = id;
        this._ref = _ref;
        this.sessionId = id;
        _ref.on('close', () => this.readyState = exports.ReadyState.CLOSED);
    }
    get ref() { return this._ref; }
    set ref(_ref) {
        this._ref = _ref;
        this.readyState = exports.ReadyState.OPEN;
    }
    send(messageOrType, messageOrOptions, options) {
        this.enqueueRaw((messageOrType instanceof schema.Schema)
            ? core.getMessageBytes[core.Protocol.ROOM_DATA_SCHEMA](messageOrType)
            : core.getMessageBytes[core.Protocol.ROOM_DATA](messageOrType, messageOrOptions), options);
    }
    enqueueRaw(data, options) {
        // use room's afterNextPatch queue
        if (options?.afterNextPatch) {
            this._afterNextPatchQueue.push([this, arguments]);
            return;
        }
        if (this.state === core.ClientState.JOINING) {
            // sending messages during `onJoin`.
            // - the client-side cannot register "onMessage" callbacks at this point.
            // - enqueue the messages to be send after JOIN_ROOM message has been sent
            this._enqueuedMessages.push(data);
            return;
        }
        this.raw(data, options);
    }
    raw(data, options, cb) {
        if (this.readyState !== exports.ReadyState.OPEN) {
            console.warn('trying to send data to inactive client', this.sessionId);
            return;
        }
        this._ref.ws.send(new Uint8Array(data), true, false);
    }
    error(code, message = '', cb) {
        this.raw(core.getMessageBytes[core.Protocol.ERROR](code, message), undefined, cb);
    }
    leave(code, data) {
        if (this.readyState !== exports.ReadyState.OPEN) {
            // connection already closed. ignore.
            return;
        }
        this.readyState = exports.ReadyState.CLOSING;
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

exports.uWebSocketClient = uWebSocketClient;
exports.uWebSocketWrapper = uWebSocketWrapper;
//# sourceMappingURL=uWebSocketClient.js.map
