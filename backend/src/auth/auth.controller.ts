import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { CustomRequest } from './custom-request.interface';

@Controller('auth')
export class AuthController {
  @Get('api42/callback')
  @UseGuards(AuthGuard('api42'))
  async api42Callback(@Req() req: CustomRequest, @Res() res: Response) {
    console.log('api42Callback called, req.user:', req.user);
    const user = req.user;
    console.log("User photos:", user.photos); // Add this line
    const userData = {
      name: user.displayName,
      avatarUrl: user.photos && user.photos.length > 0 && user.photos[0].value,
    };
    console.log("User data:", userData);
    const frontendUrl = "http://localhost:8080";
    res.redirect(
      `${frontendUrl}?name=${encodeURIComponent(userData.name)}&avatarUrl=${encodeURIComponent(userData.avatarUrl)}`
    );
  }

  @Get('api42')
  @UseGuards(AuthGuard('api42'))
  api42Login() {
    console.log('login called');
    // This route will trigger the OAuth2 authorization process
  }
}