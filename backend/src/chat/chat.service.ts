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


	public getIntraFromSocket(client: Socket): string {
		for (let [intraname, user] of this.members) {
			if (user.getSocket() == client)
				return intraname;
		}
		return undefined;
	}

	public getChannelByChannelId(key: string): Channel {
		for (let [room_id, channel] of this.channels) {
			if (key == room_id)
				return channel;
		}
		return undefined;
	}

	public addChannel(channel_id: string, owner: User) {
		this.channels.set(channel_id, new Channel(channel_id, owner));
	}

	public addUser(intra: string, client: Socket) {
		this.members.set(intra, new User(intra, this.users, client, this.getChannelByChannelId("global")));
		//console.log(this.getChannelByChannelId("global").getChannelId());
		client.join("global");
	}

	public resolvePrompt(client: Socket, prompt: string): [string, string] {
		let command: string = this.parsePrompt(prompt);
		let intra: string = this.getIntraFromSocket(client);
		let user: User = this.members.get(intra);
		let response: [string, string] = this.executeCommand(command, prompt, user);
		return response;
	}

	private parsePrompt(prompt: string): string {
		console.log("Prompt is:", prompt)
		if (prompt.indexOf("/help") == 0) {
			console.log("Command 'HELP' was identified");
			return "HELP";
		}
		console.log("No command was found, treating as a normal message");
		return "MESSAGE";
	}

	private executeCommand(command: string, prompt: string, user: User): [string, string] {
		//console.log("User:", user.getIntraname());
		//console.log("Channel_id:", user.getActiveChannel().getChannelId());
		if (command == "MESSAGE") {
			console.log("'MESSAGE' gets executed");
			return [user.getActiveChannel().getChannelId(), prompt];
		}
		else if (command == "HELP") {
			console.log("'HELP' gets executed");
			return this.help(user);
		}
	}

	private help(user: User): [string, string] {
		let response = "/help\n";
		response = response.concat("/lorem\n");
		response = response.concat("/ipsum\n");
		console.log(response);
		return [user.getSocket().id, response];
	}
}

export class User {
	constructor(
		private readonly intraname: string,
		private readonly users: Users,
		private          socket: Socket,
		private          active_channel: Channel,
	){}

	private username:	string;

	private async updateUserData() {
		this.username = await this.users.getUsernameByIntra(this.intraname);
	}

	public getUsername(): string { if (this.username == undefined) this.updateUserData(); return this.username; }

	public getIntraname(): string { return this.intraname; }
	public getSocket(): Socket { return this.socket; }
	public getActiveChannel(): Channel { return this.active_channel; }

	public setSocket(socket: Socket) { this.socket = socket; }
	public setActiveChannel(channel: Channel) { this.active_channel = channel; }
}

/**
 * our object for any chatroom (dm/global/channel)
 */
export class Channel {
	constructor(
		private readonly channel_id: string,
		private readonly owner: User,
	) {}

	private members:		User[];// TODO test if socket is changed in array when user changes
	private admins:			User[];
	private chat_history:	[user: User, message: string][];
	private password:		string;

	private initChannel() {
		this.admins.push(this.owner);
	}

	public getChannelId() { return this.channel_id; }

	public isOwner(user: User): boolean {
		if (user == this.owner)
			return (true);
		return (false);
	}

	public isAdmin(user: User): boolean {
		for (let admin of this.admins)
			if (user == admin) return (true);
		return (false);
	}

	public isMember(user: User): boolean {
		for (let member of this.members)
			if (user == member) return (true);
		return (false);
	}

	public checkPassword(input: string): boolean {
		if (input == this.password)
			return (true);
		return (false);
	}

	public getChatHistory(): [User, string][] { return (this.chat_history); }

	public addMessage(user: User, message: string) {
		if (this.chat_history.length > 42)
			this.chat_history.shift();
		this.chat_history.push([user, message]);
	}
}
