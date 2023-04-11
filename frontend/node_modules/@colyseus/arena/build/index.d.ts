import express from "express";
import { Server, ServerOptions, Transport } from "@colyseus/core";
export interface ArenaOptions {
    options?: ServerOptions;
    displayLogs?: boolean;
    getId?: () => string;
    initializeTransport?: (options: any) => Transport;
    initializeExpress?: (app: express.Express) => void;
    initializeGameServer?: (app: Server) => void;
    beforeListen?: () => void;
}
export default function (options: ArenaOptions): ArenaOptions;
/**
 * Listen on your development environment
 * @param options Arena options
 * @param port Port number to bind Colyseus + Express
 */
export declare function listen(options: ArenaOptions, port?: number): Promise<Server>;
export declare function getTransport(options: ArenaOptions): Promise<Transport>;
