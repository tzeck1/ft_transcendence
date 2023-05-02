"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const game_service_1 = require("./game.service");
const user_service_1 = require("../user/user.service");
let GameGateway = class GameGateway {
    constructor(users, gameService) {
        this.users = users;
        this.gameService = gameService;
        this.intra_clients = new Map;
        this.rooms = new Map;
        this.room_id = 0;
    }
    afterInit(server) {
        console.log('Initialized');
    }
    handleDisconnect(client) {
        console.log(`Client Disconnected: ${client.id}`);
    }
    handleConnection(client, ...args) {
        console.log(`Client Connected: ${client.id}`);
    }
    async handleCreateOrJoin(client, intra) {
        if (intra == '')
            return;
        client.join("lobby");
        this.intra_clients.set(intra, client);
        const pairedIntra = await this.matchMake(client, intra, this.intra_clients);
        if (pairedIntra != undefined) {
            let pairedUser = await this.users.getUsername(await this.users.getId(pairedIntra));
            let pairedPic = await this.users.getAvatarByIntra(pairedIntra);
            let searchingUser = await this.users.getUsername(await this.users.getId(intra));
            let searchingPic = await this.users.getAvatarByIntra(intra);
            this.server.to(this.intra_clients.get(pairedIntra).id).emit("foundOpponent", searchingUser, searchingPic);
            this.server.to(client.id).emit("foundOpponent", pairedUser, pairedPic);
        }
    }
    async matchMake(client, searching_intra, intra_clients) {
        for (let [key, element] of intra_clients) {
            if (key != searching_intra
                && (await this.users.getScore(searching_intra) > await this.users.getScore(key) - 20
                    || await this.users.getScore(searching_intra) < await this.users.getScore(key) + 20)) {
                client.leave("lobby");
                element.leave("lobby");
                let room_name = this.createRoom(element.id);
                client.join(room_name);
                element.join(room_name);
                return key;
            }
        }
        client.emit("noOpponent");
        return undefined;
    }
    createRoom(client_id) {
        this.room_id += 1;
        let name = "game" + this.room_id.toString();
        this.rooms.set(client_id, name);
        return name;
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("createOrJoin"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleCreateOrJoin", null);
GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [user_service_1.Users,
        game_service_1.GameService])
], GameGateway);
exports.GameGateway = GameGateway;
//# sourceMappingURL=game.gateway.js.map