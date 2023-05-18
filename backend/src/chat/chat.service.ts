import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Users } from '../user/user.service';
import { SubscribeMessage } from '@nestjs/websockets';

@Injectable()
export class ChatService {
	constructor( readonly users: Users ) {}

	//		key: channel_id
	private channels: Map<string, Channel> = new Map<string, Channel>;

	//		key: intraname
	private members: Map<string, User> = new Map<string, User>;

	public addChannel(channel_id: string, client: Socket, open: boolean, password: string) {
		let intra = this.getIntraFromSocket(client);
		let channel = new Channel(channel_id, intra, open, password);
		this.channels.set(channel_id, channel);
	}

	public async addUser(intra: string, client: Socket) {
		let user = new User(intra, this.users, client, "global");
		await user.updateUserData();
		this.members.set(intra, user);
		client.join("global");
	}

	public joinChannel(client: Socket, channel_id: string) {
		let user = this.getUserFromSocket(client);
		client.leave(user.getActiveChannelId());
		user.setActiveChannel(channel_id);
		client.join(user.getActiveChannelId());
	}

	public getUserFromSocket (client: Socket): User {
		for (let [intra, user] of this.members) {
			if (user.getSocket() == client)
				return user;
		}
		console.log("getUserFromSocket returned undefined");
		return undefined;
	}

	public getIntraFromSocket (client: Socket): string {
		for (let [intra, user] of this.members) {
			if (user.getSocket() == client)
				return intra;
		}
		console.log("getIntraFromSocket returned undefined");
		return undefined;
	}

	public getChannelFromId(channel_id_to_find: string) {
		for (let [channel_id, channel] of this.channels) {
			if (channel_id_to_find == channel_id)
				return channel;
		}
		console.log("getChannelFromId returned undefined");
		return undefined;
	}


	/************************************** COMMANDS ***************************************/

	message(client: Socket, message_body: string): [string, string, string] {
		let user = this.getUserFromSocket(client);
		let sender = user.getUsername() + ": ";
		let recipient = user.getActiveChannelId();
		return [recipient, sender, message_body];
	}

	unknown(client: Socket, command: string): [string, string, string] {
		let user = this.getUserFromSocket(client);
		let recipient = user.getSocket().id;
		let sender = "Error: "
		let message_body = "'" + command + "' is an unknown command or has wrong options.";
		return [recipient, sender, message_body];
	}

	help(client: Socket): [string, string, string] {
		let user = this.getUserFromSocket(client);
		let recipient = user.getSocket().id;
		let sender = "\nFloppy: \n"
		let message_body ="[mandatory] (optional)\n";
		message_body = message_body.concat("/help\n");
		message_body = message_body.concat("/create [name] (passwd)\n");
		message_body = message_body.concat("/join [channel] (passwd)\n");
		message_body = message_body.concat("/dm [username] [message]\n");
		return [recipient, sender, message_body];
	}

	create(client: Socket, channel_id: string, passwd: string, prompt: string): [string, string, string] {
		let user = this.getUserFromSocket(client);
		let recipient = user.getSocket().id;
		let message_body: string;
		let sender: string;
		if (this.channels.get(channel_id) != undefined) {
			sender = "Error: ";
			message_body = "a channel with the name " + channel_id + " already exists.";
			return [recipient, sender, message_body];
		}
		this.addChannel(channel_id, client, true, passwd);
		this.joinChannel(client, channel_id);
		sender = "Floppy: ";
		message_body = "You created and joined channel " + channel_id + " as the owner!";
		return [recipient, sender, message_body];
	}
}

/************************************** USER ***************************************/

export class User {
	constructor(
		private readonly intraname: string,
		private readonly users: Users,
		private          socket: Socket,
		private          active_channel: string,
	){}

	private username:	string;

	public async updateUserData() {
		this.username = await this.users.getUsernameByIntra(this.intraname);
	}

	public getSocket(): Socket { return this.socket; }
	public getActiveChannelId(): string { return this.active_channel; }
	public getUsername(): string { return this.username; }

	public setActiveChannel(channel: string) { this.active_channel = channel; }
}


/************************************** Channel ***************************************/

export class Channel {
	constructor(
		private readonly channel_id: string,
		private owner: string,
		private open: boolean,
		private password: string
	) {}

	private members: Array<User> = new Array<User>;
	private admins:	Array<User> = new Array<User>;
	private chat_history:[user: User, message: string][];
}
