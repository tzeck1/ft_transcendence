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
    async createNewUser(name) {
        if (await this.prisma.users.findUnique({ where: { intra_name: name } }) != null)
            return;
        const newUsersEntry = await this.prisma.users.create({
            data: {
                username: name,
                intra_name: name,
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
    async getIntraName(id) {
        const usersEntry = await this.prisma.users.findUnique({ where: { id: id } });
        return usersEntry.intra_name;
    }
    async getId(intra_name) {
        const usersEntry = await this.prisma.users.findUnique({ where: { intra_name: intra_name } });
        return usersEntry.intra_name;
    }
    async setUsername(id, new_username) {
        const updateUser = await this.prisma.users.update({
            where: { id: id },
            data: { username: new_username },
        });
    }
};
Users = __decorate([
    (0, common_1.Injectable)()
], Users);
exports.Users = Users;
//# sourceMappingURL=user.service.js.map