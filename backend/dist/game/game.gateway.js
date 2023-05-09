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
    constructor(gameService, users) {
        this.gameService = gameService;
        this.users = users;
        this.rooms = new Map;
        this.lobby = new Map;
        this.room_counter = 0;
        this.threshold = 20;
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
        let searching_player = new game_service_1.Player(client, intra, this.users);
        await searching_player.updateUserData();
        for (let [intraname, lobby_player] of this.lobby) {
            if (lobby_player.getScore() - this.threshold < searching_player.getScore() && searching_player.getScore() < lobby_player.getScore() + this.threshold) {
                this.createAndJoinRoom(searching_player, lobby_player);
                return;
            }
        }
        searching_player.getSocket().join("lobby");
        console.log("the intra is ", intra, "and the socket is ", client.id);
        this.lobby.set(intra, searching_player);
        searching_player.getSocket().emit("noOpponent");
    }
    createAndJoinRoom(player_one, player_two) {
        this.room_counter += 1;
        let room_id = "game" + this.room_counter.toString();
        player_one.getSocket().leave("lobby");
        player_two.getSocket().leave("lobby");
        this.lobby.delete(player_one.getIntraname());
        this.lobby.delete(player_two.getIntraname());
        let new_room = new game_service_1.Room(room_id, player_one, player_two);
        this.rooms.set(room_id, new_room);
        player_one.getSocket().join(room_id);
        player_two.getSocket().join(room_id);
        player_one.getSocket().emit("foundOpponent", player_two.getUsername(), player_two.getPicture(), room_id);
        player_two.getSocket().emit("foundOpponent", player_one.getUsername(), player_one.getPicture(), room_id);
    }
    handleCancelQueue(client, intra) {
        console.log("calling handleCancel");
        let player = this.lobby.get(intra);
        client.leave("lobby");
        this.lobby.delete(player.getIntraname());
        client.disconnect(true);
    }
    handleScoreRequest(client, data) {
        console.log(client.id, "sends", data.left_player_scored, "and", data.room);
        let room = this.rooms.get(data.room);
        let player;
        if (data.left_player_scored == true)
            player = room.getLeftPlayer();
        else
            player = room.getRightPlayer();
        room.validateScore(client);
        if (room.isScoreTrue() == true) {
            console.log("inside if of isScoreTrue was called");
            room.playerScored(player);
            room.spawn_ball();
        }
    }
    handlePaddleMovement(client, data) {
        let room = this.rooms.get(data.room);
        let player;
        if (room.getLeftPlayer().getSocket() == client)
            player = room.getRightPlayer();
        else
            player = room.getLeftPlayer();
        room.movePlayer(player, data);
    }
    handleIAmReady(client, room_id) {
        let room = this.rooms.get(room_id);
        room.validatePlayer(client);
        if (room.isRoomReady() == true) {
            room.getLeftPlayer().getSocket().emit("startTheGame");
            room.getRightPlayer().getSocket().emit("startTheGame");
            room.spawn_ball();
        }
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
__decorate([
    (0, websockets_1.SubscribeMessage)("cancelQueue"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleCancelQueue", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("scoreRequest"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleScoreRequest", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("paddleMovement"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handlePaddleMovement", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("iAmReady"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleIAmReady", null);
GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [game_service_1.GameService, user_service_1.Users])
], GameGateway);
exports.GameGateway = GameGateway;
//# sourceMappingURL=game.gateway.js.map