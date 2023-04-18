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
exports.TwoFactorAuthController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const tfa_service_1 = require("./tfa.service");
const user_service_1 = require("../user/user.service");
let TwoFactorAuthController = class TwoFactorAuthController {
    constructor(twoFactorAuthService, userService) {
        this.twoFactorAuthService = twoFactorAuthService;
        this.userService = userService;
    }
    async enable2FA(intra) {
        console.log(`2fa enable called with intra [${intra}]`);
        const secret = this.twoFactorAuthService.generate2FAToken();
        console.log('Generated secret:', secret);
        const qrCode = await this.twoFactorAuthService.generateQRCode(intra, secret);
        console.log(qrCode);
        await this.userService.set2FASecret(intra, secret);
        return { qrCode };
    }
    async verify2FA(req, token) {
        const secret = await this.userService.get2FASecret(req.user.id);
        const isVerified = this.twoFactorAuthService.verify2FAToken(secret, token);
        if (!isVerified)
            throw new Error('Invalid 2FA token');
        return { message: '2FA token verified successfully' };
    }
    async disable2FA(req) {
        await this.userService.set2FASecret(req.user.id, null);
        return { message: '2FA disabled successfully' };
    }
};
__decorate([
    (0, common_1.Get)('enable'),
    __param(0, (0, common_1.Query)('intra')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TwoFactorAuthController.prototype, "enable2FA", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TwoFactorAuthController.prototype, "verify2FA", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('disable'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwoFactorAuthController.prototype, "disable2FA", null);
TwoFactorAuthController = __decorate([
    (0, common_1.Controller)('2fa'),
    __metadata("design:paramtypes", [tfa_service_1.TwoFactorAuthService,
        user_service_1.Users])
], TwoFactorAuthController);
exports.TwoFactorAuthController = TwoFactorAuthController;
//# sourceMappingURL=tfa.controller.js.map