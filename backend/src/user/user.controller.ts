import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Users } from './user.service';
import { PrismaClient } from '@prisma/client';

@Controller('users')
export class UserController {

	constructor(private readonly users: Users) {}

	@Get('getUsername')
	async getUsername(id: number) {
		return this.users.getUsername(id);
	}

	@Post('setAvatar')
	async setAvatar(@Body('intra') intra: string, @Body('picture') picture: string) {
		console.log("Avatar changed to:", picture);
		this.users.setAvatar(intra, picture);
	}

	@Post('setUsername')
	async setUsername(@Body('intra') intra: string, @Body('username') username: string) {
		const response: string = await this.users.setUsername(intra, username);
		if (response)
			console.log(response);
		else
			console.log("Username already in use.");
		return (response);
	}
}
