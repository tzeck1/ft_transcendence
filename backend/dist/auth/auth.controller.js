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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const user_service_1 = require("../user/user.service");
let AuthController = class AuthController {
    constructor(users) {
        this.users = users;
    }
    async api42Callback(req, res) {
        const username = req.user.displayName;
        const frontendUrl = `http://${process.env.HOST_IP}:8080/profile?${username}`;
        res.cookie('username', JSON.stringify(username), { httpOnly: false });
        res.redirect(frontendUrl);
    }
    async getUserData(intra) {
        const userData = {
            username: await this.users.getUsernameByIntra(intra),
            avatarUrl: await this.users.getAvatarByIntra(intra),
        };
        return userData;
    }
    api42Login(res) {
        console.log('Api42Login called');
        const authorizationURL = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-8b9da2df9f37fabf5fe6330ad83da6cf15f65455a8add2bc5d0ebda92eaf4b88&redirect_uri=http%3A%2F%2F${process.env.HOST_IP}%3A3000%2Fauth%2Fapi42%2Fcallback&response_type=code`;
        res.json({ url: authorizationURL });
    }
};
__decorate([
    (0, common_1.Get)('api42/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('api42')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "api42Callback", null);
__decorate([
    (0, common_1.Get)('getUserData'),
    __param(0, (0, common_1.Query)('intra')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUserData", null);
__decorate([
    (0, common_1.Get)('api42'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "api42Login", null);
AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [user_service_1.Users])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map