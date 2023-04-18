import { TwoFactorAuthService } from './tfa.service';
import { Users } from '../user/user.service';
export declare class TwoFactorAuthController {
    private readonly twoFactorAuthService;
    private readonly userService;
    constructor(twoFactorAuthService: TwoFactorAuthService, userService: Users);
    enable2FA(intra: string): Promise<{
        qrCode: string;
    }>;
    verify2FA(req: any, token: string): Promise<{
        message: string;
    }>;
    disable2FA(req: any): Promise<{
        message: string;
    }>;
}
