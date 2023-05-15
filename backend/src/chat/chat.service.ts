import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Users } from '../user/user.service';
import { SubscribeMessage } from '@nestjs/websockets';

@Injectable()
export class ChatService {
	constructor( readonly users: Users ) {}
}

export class User {
	constructor(
		private readonly intraname: string,
		private readonly users: Users,
		private          socket: Socket,
		private          active_channel: Channel,
	){}// TODO active_channel is global channel

	private username:	string;

	async updateUserData() {
		this.username = await this.users.getUsernameByIntra(this.intraname);
	}

	getUsername(): string { if (this.username == undefined) this.updateUserData(); return this.username; }

	getIntraname(): string { return this.intraname; }
	getSocket(): Socket { return this.socket; }
	getActiveChannel(): Channel { return this.active_channel; }

	setSocket(socket: Socket) { this.socket = socket; }
	setActiveChannel(channel: Channel) { this.active_channel = channel; }
}

/**
 * our object for any chatroom (dm/global/channel)
 */
export class Channel {
	constructor(
		private readonly room_id: string,
		private readonly owner: User,
	) {}

	private members:		User[];// TODO test if socket is changed in array when user changes
	private admins:			User[];
	private chat_history:	[user: User, message: string][];
	private password:		string;

	initChannel() {
		this.admins.push(this.owner);
	}

	isOwner(user: User): boolean {
		if (user == this.owner)
			return (true);
		return (false);
	}

	isAdmin(user: User): boolean {
		for (let admin of this.admins)
			if (user == admin) return (true);
		return (false);
	}

	isMember(user: User): boolean {
		for (let member of this.members)
			if (user == member) return (true);
		return (false);
	}

	checkPassword(input: string): boolean {
		if (input == this.password)
			return (true);
		return (false);
	}

	getChatHistory(): [User, string][] { return (this.chat_history); }

	addMessage(user: User, message: string) {
		if (this.chat_history.length > 42)
			this.chat_history.shift();
		this.chat_history.push([user, message]);
	}
}
