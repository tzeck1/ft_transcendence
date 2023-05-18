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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
let UserController = class UserController {
    constructor(users) {
        this.users = users;
    }
    async getUsername(id) {
        return this.users.getUsername(id);
    }
    async getUser(intra) {
        return this.users.getUser(intra);
    }
    async getUsers() {
        return this.users.getUsers();
    }
    async getPaddleStats(intra) {
        return this.users.getPaddleStats(intra);
    }
    async setAvatar(intra, picture) {
        console.log("Avatar changed to:", picture);
        this.users.setAvatar(intra, picture);
    }
    async setUsername(intra, username) {
        const response = await this.users.setUsername(intra, username);
        if (response)
            console.log(response);
        else
            console.log("Username already in use.");
        return (response);
    }
};
__decorate([
    (0, common_1.Get)('getUsername'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsername", null);
__decorate([
    (0, common_1.Get)('getUser'),
    __param(0, (0, common_1.Query)('intra')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, common_1.Get)('getUsers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('getPaddleStats'),
    __param(0, (0, common_1.Query)('intra')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getPaddleStats", null);
__decorate([
    (0, common_1.Post)('setAvatar'),
    __param(0, (0, common_1.Body)('intra')),
    __param(1, (0, common_1.Body)('picture')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "setAvatar", null);
__decorate([
    (0, common_1.Post)('setUsername'),
    __param(0, (0, common_1.Body)('intra')),
    __param(1, (0, common_1.Body)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "setUsername", null);
UserController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.Users])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map