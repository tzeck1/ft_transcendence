export declare class Users {
    createNewUser(name: string, photo: string): Promise<void>;
    getUser(intra: string): Promise<import(".prisma/client").users>;
    getUsers(): Promise<import(".prisma/client").users[]>;
    getUsername(id: number): Promise<string>;
    getUsernameByIntra(intra_name: string): Promise<string>;
    getAvatarByIntra(intra_name: string): Promise<string>;
    getIntraName(id: number): Promise<string>;
    getId(intra_name: string): Promise<number>;
    get2FASecret(intra: string): Promise<string>;
    getTFA(intra_name: string): Promise<boolean>;
    getScore(intra_name: string): Promise<number>;
    getPaddleStats(intra: string): Promise<{
        paddle_hits_m: number;
        paddle_hits_e: number;
        paddle_miss: number;
    }>;
    setUsername(intra: string, new_username: string): Promise<string>;
    setAvatar(intra: string, picture: string): Promise<void>;
    set2FASecret(intra: string, secret: string): Promise<import(".prisma/client").users>;
    setTFA(intra: string, state: boolean): Promise<import(".prisma/client").users>;
}
