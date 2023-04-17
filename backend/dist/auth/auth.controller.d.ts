import { Response } from 'express';
import { CustomRequest } from './custom-request.interface';
import { Users } from '../user/user.service';
export declare class AuthController {
    private readonly users;
    constructor(users: Users);
    api42Callback(req: CustomRequest, res: Response): Promise<void>;
    getUserData(intra: string): Promise<any>;
    api42Login(res: Response): void;
}
