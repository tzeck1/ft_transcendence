import { Response } from 'express';
import { CustomRequest } from './custom-request.interface';
export declare class AuthController {
    api42Callback(req: CustomRequest, res: Response): Promise<void>;
    getUserData(req: CustomRequest): Promise<any>;
    api42Login(): void;
}
