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
const user_service_1 = require("../user/user.service");
const axios_1 = require("axios");
let Api42Strategy = class Api42Strategy extends (0, passport_1.PassportStrategy)(passport_oauth2_1.Strategy, 'api42') {
    constructor(users) {
        const options = {
            authorizationURL: 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-8b9da2df9f37fabf5fe6330ad83da6cf15f65455a8add2bc5d0ebda92eaf4b88&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fapi42%2Fcallback&response_type=code',
            tokenURL: 'https://api.intra.42.fr/oauth/token',
            clientID: process.env.API_42_CLIENT_ID,
            clientSecret: process.env.API_42_CLIENT_SECRET,
            callbackURL: process.env.API_42_CALLBACK_URL,
            scope: ['public profile'],
        };
        super(options);
        this.users = users;
    }
    async validate(accessToken, refreshToken, profile) {
        try {
            const response = await axios_1.default.get('https://api.intra.42.fr/v2/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const api42User = response.data;
            const userData = {
                displayName: api42User.login,
                photos: api42User.image.link ? [{ value: api42User.image.link }] : [],
            };
            this.users.createNewUser(userData.displayName);
            return (userData);
        }
        catch (error) {
            console.error('Error fetching user data from 42 API:', error);
        }
    }
};
Api42Strategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.Users])
], Api42Strategy);
exports.Api42Strategy = Api42Strategy;
//# sourceMappingURL=42api.strategy.js.map