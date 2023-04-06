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
exports.Api42Strategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_oauth2_1 = require("passport-oauth2");
let Api42Strategy = class Api42Strategy extends (0, passport_1.PassportStrategy)(passport_oauth2_1.Strategy, 'api42') {
    constructor() {
        const options = {
            authorizationURL: 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-8b9da2df9f37fabf5fe6330ad83da6cf15f65455a8add2bc5d0ebda92eaf4b88&redirect_uri=http%3A%2F%2Flocalhost%3A8080&response_type=code',
            tokenURL: 'https://api.intra.42.fr/oauth/token',
            clientID: process.env.API_42_CLIENT_ID,
            clientSecret: process.env.API_42_CLIENT_SECRET,
            callbackURL: process.env.API_42_CALLBACK_URL,
            scope: ['public'],
        };
        console.log('Api42Strategy options:', options);
        super(options);
    }
    async validate(accessToken, refreshToken, profile, done) {
    }
};
Api42Strategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], Api42Strategy);
exports.Api42Strategy = Api42Strategy;
//# sourceMappingURL=42-api.strategy.js.map