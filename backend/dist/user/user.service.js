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
const prisma_1 = require("../prisma");
let Users = class Users {
    async createNewUser(name, photo) {
        if (await prisma_1.default.users.findUnique({ where: { intra_name: name } }) != null)
            return;
        const newUsersEntry = await prisma_1.default.users.create({
            data: {
                username: name,
                intra_name: name,
                profile_picture: photo,
            }
        });
        const newStatsEntry = await prisma_1.default.stats.create({
            data: {}
        });
        console.log('user created: ', name);
    }
    async getUser(intra) {
        return prisma_1.default.users.findUnique({ where: { intra_name: intra } });
    }
    async getUsers() {
        const Users = await prisma_1.default.users.findMany({
            orderBy: {
                rank: 'desc',
            },
        });
        return Users;
    }
    async getUsername(id) {
        const usersEntry = await prisma_1.default.users.findUnique({ where: { id: id } });
        return usersEntry.username;
    }
    async getUsernameByIntra(intra_name) {
        const usersEntry = await prisma_1.default.users.findUnique({ where: { intra_name: intra_name } });
        return usersEntry.username;
    }
    async getAvatarByIntra(intra_name) {
        const usersEntry = await prisma_1.default.users.findUnique({ where: { intra_name: intra_name } });
        return usersEntry.profile_picture;
    }
    async getIntraName(id) {
        const usersEntry = await prisma_1.default.users.findUnique({ where: { id: id } });
        return usersEntry.intra_name;
    }
    async getId(intra_name) {
        const usersEntry = await prisma_1.default.users.findUnique({ where: { intra_name: intra_name } });
        return usersEntry.id;
    }
    async get2FASecret(intra) {
        const user = await prisma_1.default.users.findFirst({
            where: { intra_name: intra },
            select: { twoFactorSecret: true },
        });
        return user.twoFactorSecret;
    }
    async getTFA(intra_name) {
        const usersEntry = await prisma_1.default.users.findUnique({ where: { intra_name: intra_name } });
        return usersEntry.tfa_enabled;
    }
    async getScore(intra_name) {
        const id = await this.getId(intra_name);
        const statsEntry = await prisma_1.default.stats.findUnique({ where: { id: id } });
        return statsEntry.score;
    }
    async getPaddleStats(intra) {
        const user = await prisma_1.default.users.findUnique({
            where: {
                intra_name: intra,
            },
        });
        const userStats = await prisma_1.default.games.aggregate({
            where: {
                intra: user.intra_name,
            },
            _sum: {
                paddle_hits_m: true,
                paddle_hits_e: true,
                enemy_score: true,
            },
        });
        return {
            paddle_hits_m: userStats._sum.paddle_hits_m,
            paddle_hits_e: userStats._sum.paddle_hits_e,
            paddle_miss: userStats._sum.enemy_score,
        };
    }
    async setUsername(intra, new_username) {
        if (new_username.length < 2)
            return ("1");
        const existingUser = await prisma_1.default.users.findFirst({
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
        const updateUser = await prisma_1.default.users.update({
            where: { intra_name: intra },
            data: { username: new_username },
        });
        return (new_username);
    }
    async setAvatar(intra, picture) {
        const updateUser = await prisma_1.default.users.update({
            where: { intra_name: intra },
            data: { profile_picture: picture },
        });
    }
    async set2FASecret(intra, secret) {
        return await prisma_1.default.users.update({
            where: { intra_name: intra },
            data: { twoFactorSecret: secret },
        });
    }
    async setTFA(intra, state) {
        return await prisma_1.default.users.update({
            where: { intra_name: intra },
            data: { tfa_enabled: state },
        });
    }
    async setHackerman(intra) {
        return await prisma_1.default.users.update({
            where: { intra_name: intra },
            data: { hackerman: true }
        });
    }
};
Users = __decorate([
    (0, common_1.Injectable)()
], Users);
exports.Users = Users;
//# sourceMappingURL=user.service.js.map