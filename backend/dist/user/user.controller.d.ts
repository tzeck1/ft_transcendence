import { Users } from './user.service';
export declare class UserController {
    private readonly users;
    constructor(users: Users);
    getUsername(id: number): Promise<string>;
    getUsers(): Promise<import(".prisma/client").users[]>;
    setAvatar(intra: string, picture: string): Promise<void>;
    setUsername(intra: string, username: string): Promise<string>;
}
