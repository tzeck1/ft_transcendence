import { Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { CustomRequest } from './custom-request.interface';
import { Users } from '../user/user.service';


@Controller('auth')
export class AuthController {

	constructor(private readonly users: Users) {}

	@Get('api42/callback')
	@UseGuards(AuthGuard('api42'))
	async api42Callback(@Req() req: CustomRequest, @Res() res: Response) {
		const username = req.user.displayName;
		const frontendUrl = `http://10.13.3.7:8080/profile?${username}`;
		res.cookie('username', JSON.stringify(username), { httpOnly: false });
		res.redirect(frontendUrl);
	}

	@Get('getUserData')
		async getUserData(@Query('intra') intra: string): Promise<any> {
		const userData = {
			username: await this.users.getUsernameByIntra(intra),
			avatarUrl: await this.users.getAvatarByIntra(intra),
		}
		return userData;
	}

	@Get('api42')
	api42Login(@Res() res: Response) {
		console.log('Api42Login called');
		const authorizationURL = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-8b9da2df9f37fabf5fe6330ad83da6cf15f65455a8add2bc5d0ebda92eaf4b88&redirect_uri=http%3A%2F%2F10.13.3.7%3A3000%2Fauth%2Fapi42%2Fcallback&response_type=code';
		res.json({ url: authorizationURL });
	}
}