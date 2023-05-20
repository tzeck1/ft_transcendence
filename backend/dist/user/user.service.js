"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let Users = class Users {
    constructor() {
        this.prisma = new client_1.PrismaClient({
            datasources: {
                db: {
                    url: "postgresql://myuser:mypassword@database:5432/mydatabase?schema=public",
                },
            },
        });
    }
    async createNewUser(name, photo) {
        if (await this.prisma.users.findUnique({ where: { intra_name: name } }) != null)
            return;
        const newUsersEntry = await this.prisma.users.create({
            data: {
                username: name,
                intra_name: name,
                profile_picture: photo,
            }
        });
        const newStatsEntry = await this.prisma.stats.create({
            data: {}
        });
        console.log('user created: ', name);
    }
    async getUsername(id) {
        const usersEntry = await this.prisma.users.findUnique({ where: { id: id } });
        return usersEntry.username;
    }
    async getIntraByUsername(username) {
        const usersEntry = await this.prisma.users.findUnique({ where: { username: username } });
        if (usersEntry == undefined)
            return undefined;
        return usersEntry.intra_name;
    }
    async getUsernameByIntra(intra_name) {
        const usersEntry = await this.prisma.users.findUnique({ where: { intra_name: intra_name } });
        return usersEntry.username;
    }
    async getAvatarByIntra(intra_name) {
        const usersEntry = await this.prisma.users.findUnique({ where: { intra_name: intra_name } });
        return usersEntry.profile_picture;
    }
    async getIntraName(id) {
        const usersEntry = await this.prisma.users.findUnique({ where: { id: id } });
        return usersEntry.intra_name;
    }
    async getId(intra_name) {
        const usersEntry = await this.prisma.users.findUnique({ where: { intra_name: intra_name } });
        return usersEntry.id;
    }
    async get2FASecret(intra) {
        const user = await this.prisma.users.findFirst({
            where: { intra_name: intra },
            select: { twoFactorSecret: true },
        });
        return user.twoFactorSecret;
    }
    async getTFA(intra_name) {
        const usersEntry = await this.prisma.users.findUnique({ where: { intra_name: intra_name } });
        return usersEntry.tfa_enabled;
    }
    async getScore(intra_name) {
        const id = await this.getId(intra_name);
        const statsEntry = await this.prisma.stats.findUnique({ where: { id: id } });
        return statsEntry.score;
    }
    async setUsername(intra, new_username) {
        if (new_username.length < 2)
            return ("1");
        const existingUser = await this.prisma.users.findFirst({
            where: {
                AND: [
                    { intra_name: { not: { equals: intra } } },
                    { username: { equals: new_username, mode: 'insensitive' } },
                ],
            },
        });
        if (existingUser) {
            return ("2");
        }
        const updateUser = await this.prisma.users.update({
            where: { intra_name: intra },
            data: { username: new_username },
        });
        return (new_username);
    }
    async setAvatar(intra, picture) {
        const updateUser = await this.prisma.users.update({
            where: { intra_name: intra },
            data: { profile_picture: picture },
        });
    }
    async set2FASecret(intra, secret) {
        return await this.prisma.users.update({
            where: { intra_name: intra },
            data: { twoFactorSecret: secret },
        });
    }
    async setTFA(intra, state) {
        return await this.prisma.users.update({
            where: { intra_name: intra },
            data: { tfa_enabled: state },
        });
    }
};
Users = __decorate([
    (0, common_1.Injectable)()
], Users);
exports.Users = Users;
//# sourceMappingURL=user.service.js.map