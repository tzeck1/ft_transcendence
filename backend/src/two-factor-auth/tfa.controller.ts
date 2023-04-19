import { Controller, Get, Post, Request, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TwoFactorAuthService } from './tfa.service';
import { Users } from '../user/user.service';

@Controller('2fa')
export class TwoFactorAuthController {

	constructor(
		private readonly twoFactorAuthService: TwoFactorAuthService,
		private readonly userService: Users,
	) {}

	// @UseGuards(JwtAuthGuard)
	@Get('enable')
	async enable2FA(@Query('intra') intra: string) {
		console.log(`2fa enable called with intra [${intra}]`);
		const secret = this.twoFactorAuthService.generate2FAToken();
		console.log('Generated secret:', secret);
		const qrCode = await this.twoFactorAuthService.generateQRCode(intra, secret);
		console.log(qrCode);
		await this.userService.set2FASecret(intra, secret);
		return { qrCode };
	}

	@UseGuards(JwtAuthGuard)
	@Post('verify')
	async verify2FA(@Request() req, @Query('token') token: string) {
		const secret = await this.userService.get2FASecret(req.user.id);
		const isVerified = this.twoFactorAuthService.verify2FAToken(secret, token);
		if (!isVerified)
			throw new Error('Invalid 2FA token');
		return { message: '2FA token verified successfully' };
	}

	@UseGuards(JwtAuthGuard)
	@Get('disable')
	async disable2FA(@Request() req) {
		await this.userService.set2FASecret(req.user.id, null);
		return { message: '2FA disabled successfully' };
	}
}

