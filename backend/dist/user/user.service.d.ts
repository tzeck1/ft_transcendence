import { PrismaClient } from '@prisma/client';
export declare class Users {
    prisma: PrismaClient<{
        datasources: {
            db: {
                url: string;
            };
        };
    }, never, false>;
    createNewUser(name: string): Promise<void>;
    getUsername(id: number): Promise<string>;
    getUsernameByIntra(intra_name: string): Promise<string>;
    getIntraName(id: number): Promise<string>;
    getId(intra_name: string): Promise<string>;
    setUsername(id: number, new_username: string): Promise<void>;
}
