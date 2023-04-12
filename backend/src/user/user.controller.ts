import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Users } from './user.service';
import { PrismaClient } from '@prisma/client';

@Controller('users')
export class UserController {
    constructor(private readonly users: Users) {}

    @Get('getUsername')
    async getUsername(id: number) {
        return this.users.getUsername(id);
    }
}
