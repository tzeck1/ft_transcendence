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
exports.Game = exports.Room = exports.Player = exports.Games = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const prisma_1 = require("../prisma");
let Games = class Games {
    constructor(users) {
        this.users = users;
    }
};
Games = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.Users])
], Games);
exports.Games = Games;
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
        this.left_score_status = false;
        this.right_score_status = false;
        this.left_score = 0;
        this.right_score = 0;
        this.ball_x = 0;
        this.ball_y = 0;
        this.left_player_y = 0;
        this.right_player_y = 0;
        this.height = 1080;
        this.width = 1920;
        this.ball_start_velocity = 400;
        this.ball_spawn_distance = 6;
        this.next_ball_spawn_left = false;
        this.next_ball_spawn_right = false;
    }
    getRoomId() { return this.room_id; }
    getLeftPlayer() { return this.left_player; }
    getRightPlayer() { return this.right_player; }
    moveBoth(player, enemy, inputPayload) {
        let player_socket = player.getSocket();
        let enemy_socket = enemy.getSocket();
        if (inputPayload.up == true) {
            player_socket.emit('myPaddleUp');
            enemy_socket.emit("enemyPaddleUp");
        }
        else if (inputPayload.down == true) {
            player_socket.emit('myPaddleDown');
            enemy_socket.emit("enemyPaddleDown");
        }
    }
    setNewBallData(x, y, velocity, speed) {
        this.right_player.getSocket().emit('newBallData', x, y, velocity, speed);
    }
    isRoomReady() {
        if (this.left_player_status && this.right_player_status)
            return true;
        return false;
    }
    isScoreTrue() {
        if (this.left_score_status && this.right_score_status)
            return true;
        return false;
    }
    validatePlayer(client) {
        if (client == this.left_player.getSocket())
            this.left_player_status = true;
        else if (client == this.right_player.getSocket())
            this.right_player_status = true;
    }
    validateScore(client) {
        if (client == this.left_player.getSocket())
            this.left_score_status = true;
        else if (client == this.right_player.getSocket())
            this.right_score_status = true;
    }
    spawn_ball() {
        let x, y, p;
        console.log("spawnball was called");
        if (Math.random() < 0.5)
            p = Math.random() * (this.height / this.ball_spawn_distance);
        else
            p = Math.random() * (this.height / this.ball_spawn_distance) + ((this.ball_spawn_distance - 1) * this.height / this.ball_spawn_distance);
        if (p > this.height / 2)
            y = (Math.random() - 1.5) * this.ball_start_velocity;
        else
            y = (Math.random() + 0.5) * this.ball_start_velocity;
        if (this.next_ball_spawn_left)
            x = this.ball_start_velocity * -1;
        else if (this.next_ball_spawn_right)
            x = this.ball_start_velocity;
        else {
            if (Math.random() < 0.5)
                x = this.ball_start_velocity * -1;
            else
                x = this.ball_start_velocity;
        }
        this.left_player.getSocket().emit('spawnBall', p, x, y);
        this.right_player.getSocket().emit('spawnBall', p, x * -1, y);
    }
    playerScored(player) {
        console.log("playerScored was called from", player.getIntraname());
        if (player == this.left_player)
            console.log("He was true left player");
        else
            console.log("He was NOT the true left player");
        if (this.left_player == player)
            this.left_score++;
        else
            this.right_score++;
        this.left_player.getSocket().emit('newScore', this.left_score, this.right_score);
        this.right_player.getSocket().emit('newScore', this.right_score, this.left_score);
        this.left_score_status = false;
        this.right_score_status = false;
    }
}
exports.Room = Room;
let Game = class Game {
    async setGameData(intra, player, enemy, player_score, enemy_score, ranked, paddle_hits_e, paddle_hits_m) {
        const newUsersEntry = await prisma_1.default.games.create({
            data: {
                intra: intra,
                player: player,
                enemy: enemy,
                player_score: player_score,
                enemy_score: enemy_score,
                ranked: ranked,
                date: new Date(),
                paddle_hits_e: paddle_hits_e,
                paddle_hits_m: paddle_hits_m,
            },
        });
        if (player_score > enemy_score) {
            await prisma_1.default.users.update({
                where: {
                    intra_name: intra,
                },
                data: {
                    rank: { increment: 1 },
                    games_won: { increment: 1 }
                }
            });
        }
        else {
            const user = await prisma_1.default.users.findUnique({
                where: {
                    intra_name: intra,
                },
            });
            if (user && user.rank > 0) {
                await prisma_1.default.users.update({
                    where: {
                        intra_name: intra,
                    },
                    data: {
                        rank: { decrement: 1 },
                        games_lost: { increment: 1 }
                    }
                });
            }
        }
        await prisma_1.default.users.update({
            where: {
                intra_name: intra,
            },
            data: {
                games_played: { increment: 1 }
            }
        });
    }
    async getLastGame(intra) {
        const latestGame = await prisma_1.default.games.findFirst({
            where: {
                intra: intra,
            },
            orderBy: {
                date: 'desc',
            },
        });
        return latestGame;
    }
    async getUserGames(intra) {
        const userGames = await prisma_1.default.games.findMany({
            where: {
                intra: intra,
            },
            orderBy: {
                date: 'desc',
            },
        });
        userGames.forEach(game => {
            game.formattedDate = formatDate(game.date);
        });
        return userGames;
    }
    async getUserGamesAsc(intra) {
        const userGames = await prisma_1.default.games.findMany({
            where: {
                intra: intra,
            },
            orderBy: {
                date: 'asc',
            },
        });
        userGames.forEach(game => {
            game.formattedDate = formatDate(game.date);
        });
        return userGames;
    }
};
Game = __decorate([
    (0, common_1.Injectable)()
], Game);
exports.Game = Game;
function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear().toString().substr(-2);
    return `${day}/${month}/${year}`;
}
//# sourceMappingURL=game.service.js.map