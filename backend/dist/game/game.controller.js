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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
let GameController = class GameController {
    constructor(games) {
        this.games = games;
    }
    async setGameData(intra, player, enemy, player_score, enemy_score, ranked) {
        console.log("went into setGameData");
        return this.games.setGameData(intra, player, enemy, player_score, enemy_score, ranked);
    }
    async getLastGame(intra) {
        return this.games.getLastGame(intra);
    }
    async getUserGames(intra) {
        return this.games.getUserGames(intra);
    }
};
__decorate([
    (0, common_1.Post)('setGameData'),
    __param(0, (0, common_1.Body)('intra')),
    __param(1, (0, common_1.Body)('player')),
    __param(2, (0, common_1.Body)('enemy')),
    __param(3, (0, common_1.Body)('player_score')),
    __param(4, (0, common_1.Body)('enemy_score')),
    __param(5, (0, common_1.Body)('ranked')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number, Boolean]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "setGameData", null);
__decorate([
    (0, common_1.Get)('getLastGame'),
    __param(0, (0, common_1.Query)('intra')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getLastGame", null);
__decorate([
    (0, common_1.Get)('getUserGames'),
    __param(0, (0, common_1.Query)('intra')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getUserGames", null);
GameController = __decorate([
    (0, common_1.Controller)('game'),
    __metadata("design:paramtypes", [game_service_1.Game])
], GameController);
exports.GameController = GameController;
//# sourceMappingURL=game.controller.js.map