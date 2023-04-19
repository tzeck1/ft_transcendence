export declare class TwoFactorAuthService {
    generate2FAToken(): string;
    verify2FAToken(secret: string, token: string): boolean;
    generateQRCode(intra: string, secret: string): Promise<string>;
}
