import { Users } from '../user/user.service';
import { User } from './user.type';
declare const Api42Strategy_base: new (...args: any[]) => any;
export declare class Api42Strategy extends Api42Strategy_base {
    private readonly users;
    constructor(users: Users);
    validate(accessToken: string, refreshToken: string, profile: any): Promise<User>;
}
export {};
