import { Request } from 'express';
import { User } from './user.type';
export interface CustomRequest extends Request {
    user: User;
}
