import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { CustomRequest } from './custom-request.interface';

@Controller('auth')
export class AuthController {
  @Get('api42/callback')
  @UseGuards(AuthGuard('api42'))
  async api42Callback(@Req() req: CustomRequest, @Res() res: Response) {
    // You can access the user data in req.user
    // Set a session or a JWT here for your user
    const user = req.user;
    const userData = {
      name: user.displayName,
      avatarUrl: user.photos && user.photos[0].value,
    };
	const frontendUrl = "http://localhost:8080";
	res.redirect(
		`${frontendUrl}?name=${encodeURIComponent(userData.name)}&avatarUrl=${encodeURIComponent(userData.avatarUrl)}`
	  );
    // res.json(userData);
  }

  @Get('api42')
  @UseGuards(AuthGuard('api42'))
  api42Login() {
    // This route will trigger the OAuth2 authorization process
  }
}