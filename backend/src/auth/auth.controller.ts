import { Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { CustomRequest } from './custom-request.interface';
import { Users } from '../user/user.service';
import { ConfigService } from '@nestjs/config';


@Controller('auth')
export class AuthController {

	constructor(private readonly users: Users) {}

	@Get('api42/callback')
	@UseGuards(AuthGuard('api42'))
	async api42Callback(@Req() req: CustomRequest, @Res() res: Response) {
		const username = req.user.displayName;
		const frontendUrl = `http://${process.env.HOST_IP}:8080`;
		res.cookie('username', JSON.stringify(username), { httpOnly: false });
		res.redirect(frontendUrl);
	}

	@Get('getUserData')
		async getUserData(@Query('intra') intra: string): Promise<any> {
		// const userData = {
		// 	username: await this.users.getUsernameByIntra(intra),
		// 	avatarUrl: await this.users.getAvatarByIntra(intra),
		// 	tfa_enabled: await this.users.getTFA(intra),
		// }
		// return userData;
		return this.users.getUser(intra);
	}

	@Get('api42')
	api42Login(@Res() res: Response) {
		console.log('Api42Login called');
		const authorizationURL = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.API_42_CLIENT_ID}&redirect_uri=http%3A%2F%2F${process.env.HOST_IP}%3A3000%2Fauth%2Fapi42%2Fcallback&response_type=code`;
		res.json({ url: authorizationURL });
	}
}