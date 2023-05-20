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
		if (await this.prisma.users.findUnique( {where: {intra_name: name}} ) != null)
			return;
		const newUsersEntry = await this.prisma.users.create( {
			data: {
				username:			name,
				intra_name:			name,
				profile_picture:	photo,
			}
		})
		const newStatsEntry = await this.prisma.stats.create( {
			data: {}
		})
		console.log('user created: ', name);
	}

	/*	========== GETTER ==========	*/

	async getUsername(id: number): Promise<string> {
		const usersEntry = await this.prisma.users.findUnique( {where: {id: id}} );
		return usersEntry.username;
	}

	async getIntraByUsername(username: string): Promise<string> {
		const usersEntry = await this.prisma.users.findUnique( {where: {username: username}} );
		if (usersEntry == undefined)
			return undefined;
		return usersEntry.intra_name;
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

	async getId(intra_name: string): Promise<number> {
		const usersEntry = await this.prisma.users.findUnique( {where: {intra_name: intra_name}} );
		return usersEntry.id;
	}
	
	async get2FASecret(intra: string): Promise<string> {
		const user = await this.prisma.users.findFirst({
			where: { intra_name: intra },
			select: { twoFactorSecret: true },
		});
		return user.twoFactorSecret;
	}

	async getTFA(intra_name: string): Promise<boolean> {
		const usersEntry = await this.prisma.users.findUnique( {where: {intra_name: intra_name}} );
		return usersEntry.tfa_enabled;
	}

	async getScore(intra_name: string): Promise<number> {
		const id = await this.getId(intra_name);
		const statsEntry = await this.prisma.stats.findUnique( {where: {id: id}} );
		return statsEntry.score;
	}

	/*	========== SETTER ==========	*/

	async setUsername(intra: string, new_username: string) {
		if (new_username.length < 2)
			return ("1");
		const existingUser = await this.prisma.users.findFirst({
		  where: {
			AND: [
			  { intra_name: { not: { equals: intra } } },
			  { username: { equals: new_username, mode: 'insensitive' } },
			],
		  },
		});
		if (existingUser) {
			return ("2");
		}

		const updateUser = await this.prisma.users.update({
		  where: { intra_name: intra },
		  data: { username: new_username },
		});

		return (new_username);
	  }

	async setAvatar(intra: string, picture: string) {
		const updateUser = await this.prisma.users.update({
			where: {intra_name: intra},
			data:  {profile_picture: picture},
		});
	}

	async set2FASecret(intra: string, secret: string) {
		return await this.prisma.users.update({
			where: { intra_name: intra },
			data: { twoFactorSecret: secret },
		});
	}

	async setTFA(intra: string, state: boolean) {
		return await this.prisma.users.update({
			where: { intra_name: intra },
			data: { tfa_enabled: state },
		});
	}
}
