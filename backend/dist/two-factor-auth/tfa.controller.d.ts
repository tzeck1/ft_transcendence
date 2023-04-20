import { TwoFactorAuthService } from './tfa.service';
import { Users } from '../user/user.service';
export declare class TwoFactorAuthController {
    private readonly twoFactorAuthService;
    private readonly userService;
    constructor(twoFactorAuthService: TwoFactorAuthService, userService: Users);
    enable2FA(intra: string): Promise<{
        qrCode: string;
    }>;
    verify2FA(intra: string, token: string): Promise<{
        message: string;
    }>;
    disable2FA(intra: string): Promise<{
        message: string;
    }>;
}
