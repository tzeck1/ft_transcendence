import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class Users {
  prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://myuser:mypassword@database:5432/mydatabase?schema=public",
        },
    },
  });

  /**
   * if user does not exist yet, creates database entries in users and stats tables
   * @param name username and intra_name to register
   */
  async createNewUser(name: string, photo: string) {
    if (await this.prisma.users.findUnique( {where: {intra_name: name}} ) != null) return;
    const newUsersEntry = await this.prisma.users.create( {
        data: {
            username:   name,
            intra_name: name,
            profile_picture: photo,
        }
    })
    const newStatsEntry = await this.prisma.stats.create( {
        data: {}
    })
    console.log('user created: ', name);
  }

  async getUsername(id: number): Promise<string> {
    const usersEntry = await this.prisma.users.findUnique( {where: {id: id}} );
    return usersEntry.username;
  }

  async getUsernameByIntra(intra_name: string): Promise<string> {
    const usersEntry = await this.prisma.users.findUnique( {where: {intra_name: intra_name}} );
    return usersEntry.username;
  }

  async getAvatarByIntra(intra_name: string): Promise<string> {
    const usersEntry = await this.prisma.users.findUnique( {where: {intra_name: intra_name}} );
    return usersEntry.profile_picture;
  }

  async getIntraName(id: number): Promise<string> {
    const usersEntry = await this.prisma.users.findUnique( {where: {id: id}} );
    return usersEntry.intra_name;
  }

  async getId(intra_name: string): Promise<string> {
    const usersEntry = await this.prisma.users.findUnique( {where: {intra_name: intra_name}} );
    return usersEntry.intra_name;
  }

  async setUsername(id: number, new_username: string) {
    const updateUser = await this.prisma.users.update({
        where: {id:id},
        data:  {username: new_username},
    });
  }

  async setAvatar(intra: string, picture: string) {
    const updateUser = await this.prisma.users.update({
        where: {intra_name: intra},
        data:  {profile_picture: picture},
    });
  }
}
