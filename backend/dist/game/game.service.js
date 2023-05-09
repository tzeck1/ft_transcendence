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
exports.Room = exports.Player = exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
let GameService = class GameService {
    constructor(users) {
        this.users = users;
    }
};
GameService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.Users])
], GameService);
exports.GameService = GameService;
class Player {
    constructor(socket, intraname, users) {
        this.socket = socket;
        this.intraname = intraname;
        this.users = users;
    }
    async updateUserData() {
        this.username = await this.users.getUsernameByIntra(this.intraname);
        this.picture = await this.users.getAvatarByIntra(this.intraname);
        this.score = await this.users.getScore(this.intraname);
    }
    getSocket() { return this.socket; }
    getIntraname() { return this.intraname; }
    getUsername() { if (this.username == undefined)
        this.updateUserData(); return this.username; }
    getPicture() { if (this.picture == undefined)
        this.updateUserData(); return this.picture; }
    getScore() { if (this.score == undefined)
        this.updateUserData(); return this.score; }
}
exports.Player = Player;
class Room {
    constructor(room_id, left_player, right_player) {
        this.room_id = room_id;
        this.left_player = left_player;
        this.right_player = right_player;
        this.left_player_status = false;
        this.right_player_status = false;
        this.left_score = 0;
        this.right_score = 0;
        this.ball_x = 0;
        this.ball_y = 0;
        this.left_player_y = 0;
        this.right_player_y = 0;
    }
    getRoomId() { return this.room_id; }
    getLeftPlayer() { return this.left_player; }
    getRightPlayer() { return this.right_player; }
    movePlayer(player, inputPayload) {
        if (inputPayload.up == true)
            player.getSocket().emit('enemyPaddleUp');
        else if (inputPayload.down == true)
            player.getSocket().emit('enemyPaddleDown');
    }
    isRoomReady() {
        if (this.left_player_status && this.right_player_status)
            return true;
        return false;
    }
    validatePlayer(client) {
        if (client == this.left_player.getSocket())
            this.left_player_status = true;
        else if (client == this.right_player.getSocket())
            this.right_player_status = true;
    }
}
exports.Room = Room;
//# sourceMappingURL=game.service.js.map