import { Users } from './user.service';
export declare class UserController {
    private readonly users;
    constructor(users: Users);
    getUsername(id: number): Promise<string>;
}
