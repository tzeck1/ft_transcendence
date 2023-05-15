export declare class Users {
    createNewUser(name: string, photo: string): Promise<void>;
    getUsername(id: number): Promise<string>;
    getUsernameByIntra(intra_name: string): Promise<string>;
    getAvatarByIntra(intra_name: string): Promise<string>;
    getIntraName(id: number): Promise<string>;
    getId(intra_name: string): Promise<number>;
    get2FASecret(intra: string): Promise<string>;
    getTFA(intra_name: string): Promise<boolean>;
    getScore(intra_name: string): Promise<number>;
    setUsername(intra: string, new_username: string): Promise<string>;
    setAvatar(intra: string, picture: string): Promise<void>;
    set2FASecret(intra: string, secret: string): Promise<import(".prisma/client").users>;
    setTFA(intra: string, state: boolean): Promise<import(".prisma/client").users>;
}
