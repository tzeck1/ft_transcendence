import { VerifyCallback } from 'passport-oauth2';
declare const Api42Strategy_base: new (...args: any[]) => any;
export declare class Api42Strategy extends Api42Strategy_base {
    constructor();
    validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any>;
}
export {};
