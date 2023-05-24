import { Users } from './user.service';
export declare class UserController {
    private readonly users;
    constructor(users: Users);
    getUsername(id: number): Promise<string>;
    getUser(intra: string): Promise<import(".prisma/client").users>;
    getUsers(): Promise<import(".prisma/client").users[]>;
    getPaddleStats(intra: string): Promise<{
        paddle_hits_m: number;
        paddle_hits_e: number;
        paddle_miss: number;
    }>;
    setAvatar(intra: string, picture: string): Promise<void>;
    setUsername(intra: string, username: string): Promise<string>;
    setHackerman(intra: string): Promise<void>;
}
