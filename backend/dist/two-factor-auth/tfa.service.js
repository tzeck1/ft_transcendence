"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorAuthService = void 0;
const common_1 = require("@nestjs/common");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
let TwoFactorAuthService = class TwoFactorAuthService {
    generate2FAToken() {
        const secret = speakeasy.generateSecret({ length: 20 });
        return secret.base32;
    }
    verify2FAToken(secret, token) {
        const verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
        });
        return verified;
    }
    async generateQRCode(intra, secret) {
        const otpURL = speakeasy.otpauthURL({
            secret: secret,
            encoding: 'base32',
            label: encodeURIComponent(`ft_transcendence:${intra}`),
            issuer: encodeURIComponent('ft_transcendence'),
        });
        const qrCodeDataURL = await QRCode.toDataURL(otpURL, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            scale: 4,
        });
        return qrCodeDataURL;
    }
};
TwoFactorAuthService = __decorate([
    (0, common_1.Injectable)()
], TwoFactorAuthService);
exports.TwoFactorAuthService = TwoFactorAuthService;
//# sourceMappingURL=tfa.service.js.map