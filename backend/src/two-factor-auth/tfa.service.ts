import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorAuthService {

	generate2FAToken(): string {
		const secret = speakeasy.generateSecret({ length: 20 });
		return secret.base32;
	}

	verify2FAToken(secret: string, token: string): boolean {
		const verified = speakeasy.totp.verify({
			secret: secret,
			encoding: 'base32',
			token: token,
		});
		return verified;
	}

	async generateQRCode(intra: string, secret: string): Promise<string> {
		const otpURL = speakeasy.otpauthURL({
			secret: secret,
			encoding: 'base32',
			label: encodeURIComponent(`ft_transcendence:${intra}`),
			issuer: encodeURIComponent('ft_transcendence'),
		});

		const qrCodeDataURL = await QRCode.toDataURL(otpURL, {
			errorCorrectionLevel: 'M',
			type: 'image/png',
			scale: 4,
		});

		return qrCodeDataURL;
	}

}
