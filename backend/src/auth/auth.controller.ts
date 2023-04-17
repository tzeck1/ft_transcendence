import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { CustomRequest } from './custom-request.interface';
import { Users } from '../user/user.service';

let userData;

@Controller('auth')
export class AuthController {
  constructor(private readonly users: Users) {}
  @Get('api42/callback')
  @UseGuards(AuthGuard('api42'))
  async api42Callback(@Req() req: CustomRequest, @Res() res: Response) {
    // console.log("User data in api42/callback controller:", userData);
    const user = req.user;
    userData = {
      name: user.displayName,
      avatarUrl: user.photos && user.photos.length > 0 && user.photos[0].value,
    };
    const username = await this.users.getUsernameByIntra(req.user.displayName);
    const frontendUrl = `http://localhost:8080/profile?${username}`;
    res.cookie('username', JSON.stringify(username), { httpOnly: false });
    res.redirect(frontendUrl);
  }

  @Get('getUserData')
    async getUserData(@Req() req: CustomRequest): Promise<any> {
  return userData;
}

  @Get('api42')
  // @UseGuards(AuthGuard('api42'))
  api42Login(@Res() res: Response) {
   console.log('Api42Login called');
   const authorizationURL = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-8b9da2df9f37fabf5fe6330ad83da6cf15f65455a8add2bc5d0ebda92eaf4b88&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fapi42%2Fcallback&response_type=code';
   res.json({ url: authorizationURL });
  }
}