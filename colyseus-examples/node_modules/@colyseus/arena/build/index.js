'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var http = require('http');
var path = require('path');
var cors = require('cors');
var express = require('express');
var dotenv = require('dotenv');
var core = require('@colyseus/core');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var cors__default = /*#__PURE__*/_interopDefaultLegacy(cors);
var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var dotenv__default = /*#__PURE__*/_interopDefaultLegacy(dotenv);

// try to import uWebSockets-express compatibility layer.
let uWebSocketsExpressCompatibility;
try {
    uWebSocketsExpressCompatibility = require('uwebsockets-express').default;
}
catch (e) { }
/**
 * Do not auto-load `${environment}.env` file when using Arena service.
 */
if (process.env.NODE_ARENA !== "true") {
    const envFilename = (process.env.NODE_ENV === "production")
        ? "arena.env"
        : `${process.env.NODE_ENV || "development"}.env`;
    // return the first .env path found
    const envPath = [
        path__default['default'].resolve(path__default['default'].dirname(require?.main?.filename || process.cwd()), "..", envFilename),
        path__default['default'].resolve(process.cwd(), envFilename)
    ].find((envPath) => fs__default['default'].existsSync(envPath));
    if (envPath) {
        dotenv__default['default'].config({ path: envPath });
        console.log(`✅ ${envFilename} loaded.`);
    }
    else {
        console.log(`⚠️  ${envFilename} not found.`);
    }
}
const ALLOWED_KEYS = {
    'displayLogs': "boolean",
    'options': "object",
    'getId': "function",
    'initializeTransport': "function",
    'initializeExpress': "function",
    'initializeGameServer': "function",
    'beforeListen': "function"
};
function index (options) {
    for (const option in options) {
        if (!ALLOWED_KEYS[option]) {
            throw new Error(`❌ Invalid option '${option}'. Allowed options are: ${Object.keys(ALLOWED_KEYS).join(", ")}`);
        }
        if (typeof (options[option]) !== ALLOWED_KEYS[option]) {
            throw new Error(`❌ Invalid type for ${option}: please provide a ${ALLOWED_KEYS[option]} value.`);
        }
    }
    return options;
}
/**
 * Listen on your development environment
 * @param options Arena options
 * @param port Port number to bind Colyseus + Express
 */
async function listen(options, port = Number(process.env.PORT || 2567)) {
    const serverOptions = options.options || {};
    options.displayLogs = options.displayLogs ?? true;
    const transport = await getTransport(options);
    const gameServer = new core.Server({
        ...serverOptions,
        transport,
    });
    await options.initializeGameServer?.(gameServer);
    await options.beforeListen?.();
    gameServer.listen(port);
    if (options.displayLogs) {
        const appId = options.getId?.() || "[ Colyseus ]";
        if (appId) {
            console.log(`🏟  ${appId}`);
        }
        console.log(`⚔️  Listening on ws://localhost:${port}`);
    }
    return gameServer;
}
async function getTransport(options) {
    let transport;
    if (!options.initializeTransport) {
        options.initializeTransport = core.Server.prototype['getDefaultTransport'];
    }
    let app = express__default['default']();
    let server = http__default['default'].createServer(app);
    transport = await options.initializeTransport({ server });
    if (options.initializeExpress) {
        // uWebSockets.js + Express compatibility layer.
        // @ts-ignore
        if (transport['app']) {
            if (typeof (uWebSocketsExpressCompatibility) === "function") {
                if (options.displayLogs) {
                    console.info("✅ uWebSockets.js + Express compatibility enabled");
                }
                // @ts-ignore
                server = undefined;
                // @ts-ignore
                app = uWebSocketsExpressCompatibility(transport['app']);
            }
            else {
                if (options.displayLogs) {
                    console.warn("");
                    console.warn("❌ uWebSockets.js + Express compatibility mode couldn't be loaded, run the following command to fix:");
                    console.warn("👉 npm install --save uwebsockets-express");
                    console.warn("");
                }
                app = undefined;
            }
        }
        if (app) {
            // Enable CORS + JSON parsing.
            app.use(cors__default['default']());
            app.use(express__default['default'].json());
            await options.initializeExpress(app);
            if (options.displayLogs) {
                console.info("✅ Express initialized");
            }
        }
    }
    return transport;
}

exports.default = index;
exports.getTransport = getTransport;
exports.listen = listen;
//# sourceMappingURL=index.js.map
