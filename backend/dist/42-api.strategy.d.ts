import { VerifyCallback } from 'passport-oauth2';
import { Users } from './user/user.service';
declare const Api42Strategy_base: new (...args: any[]) => any;
export declare class Api42Strategy extends Api42Strategy_base {
    private readonly users;
    constructor(users: Users);
    validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any>;
}
export {};
