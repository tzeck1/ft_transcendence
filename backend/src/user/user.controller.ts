import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Users } from './user.service';
import { PrismaClient } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { send } from 'process';

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
	@Get('getFRequests')
	async getFRequests(@Query('intra') intra: string) {
		return this.users.getFRequests(intra);
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

	@Post('setZucc')
	async setZucc(@Body('intra') intra: string) {
		await this.users.setZucc(intra);
	}

	@UseGuards(JwtAuthGuard)
	@Post('setFRequest')
	async setFRequest(@Body('intra') sendTo: string, @Body('amigo') cameFrom: string, @Body('sending') sending: boolean) {
		const amigo = await this.getUser(cameFrom);
		if (amigo.f_requests.includes(sendTo) && sending == true)
			await this.setFriends(sendTo, cameFrom);
		else if (sending == true)
			await this.users.setFRequest(sendTo, cameFrom);
		else if (sending == false)
			await this.users.unSetFRequest(sendTo, cameFrom);
	}

	@UseGuards(JwtAuthGuard)
	@Post('setFriends')
	async setFriends(@Body('intra') intra: string, @Body('amigo') amigo: string) {
		await this.users.setFriend(intra, amigo);
		await this.users.setFriend(amigo, intra);
	}

	@UseGuards(JwtAuthGuard)
	@Post('killFriend')
	async killFriends(@Body('intra') intra: string, @Body('amigo') amigo: string) {
		await this.users.killFriend(amigo, intra);
		return await this.users.killFriend(intra, amigo);
	}
}
