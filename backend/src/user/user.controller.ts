import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Users } from './user.service';
import { PrismaClient } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UserController {

	constructor(private readonly users: Users) {}

	@UseGuards(JwtAuthGuard)
	@Get('getUsername')
	async getUsername(id: number) {
		return this.users.getUsername(id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('getUser')
	async getUser(@Query('intra') intra: string) {
		return this.users.getUser(intra);
	}

	@UseGuards(JwtAuthGuard)
	@Get('getPicByUsername')
	async getPicByUsername(@Query('username') username: string) {
		return this.users.getPicByUsername(username);
	}

	@UseGuards(JwtAuthGuard)
	@Get('getUsers')
	async getUsers() {
		return this.users.getUsers();
	}

	@UseGuards(JwtAuthGuard)
	@Get('getPaddleStats')
	async getPaddleStats(@Query('intra') intra: string) {
		return this.users.getPaddleStats(intra);
	}

	@UseGuards(JwtAuthGuard)
	@Post('setAvatar')
	async setAvatar(@Body('intra') intra: string, @Body('picture') picture: string) {
		console.log("Avatar changed to:", picture);
		this.users.setAvatar(intra, picture);
	}

	@UseGuards(JwtAuthGuard)
	@Post('setUsername')
	async setUsername(@Body('intra') intra: string, @Body('username') username: string) {
		const response: string = await this.users.setUsername(intra, username);
		if (response)
			console.log(response);
		else
			console.log("Username already in use.");
		return (response);
	}

	@UseGuards(JwtAuthGuard)
	@Post('setTenComp')
	async setTenComp(@Body('intra') intra: string) {
		await this.users.setTenComp(intra);
	}

	@UseGuards(JwtAuthGuard)
	@Post('setTopThree')
	async setTopThree(@Body('intra') intra: string) {
		await this.users.setTopThree(intra);
	}

	@Post('setHackerman')
	async setHackerman(@Body('intra') intra: string) {
		await this.users.setHackerman(intra);
	}
}
