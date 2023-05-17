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

	public getChannelByChannelId(channel_id: string): Channel {
		for (let [key, channel] of this.channels) {
			if (key == channel_id)
				return channel;
		}
		return undefined;
	}

	public addChannel(channel_id: string, owner: User, password: string) {
		this.channels.set(channel_id, new Channel(channel_id, owner, password));
	}

	public addUser(intra: string, client: Socket) {
		this.members.set(intra, new User(intra, this.users, client, "global"));
		client.join("global");
	}

	public resolvePrompt(client: Socket, prompt: string): [string, string] {
		let intra: string = this.getIntraFromSocket(client);
		let user: User = this.members.get(intra);
		let response: [string, string] = this.parsePrompt(prompt, user);
		return response;
	}

	public channelExists(channel_id: string): boolean {
		for (let [key, channel] of this.channels) {
			if (key == channel_id)
				return true;
		}
		return false;
	}

	private parsePrompt(prompt: string, user: User): [string, string] {
		let tokens: string[] = prompt.split(' ', 3);
		if (tokens[0] == "/help" && tokens.length == 1) {
			console.log("Command 'HELP' was identified");
			return this.help(prompt, user);
		}
		else if (tokens[0] == "/join") {
			console.log("Command 'JOIN' was identified");
			if (tokens[1] == undefined)
				return [user.getSocket().id, prompt + "\n" + "Error: no channel specified"]
			return this.join(prompt, user, tokens[1], tokens[2]);
		}
		else if (tokens[0][0] == "/")
			return [user.getSocket().id, prompt + "\n" + "Error: Unknown command"];
		else {
			console.log("No command identified");
			return [user.getActiveChannel(), prompt];
		}
	}

	private help(prompt: string, user: User): [string, string] {
		console.log("'HELP' gets executed");
		let response = "/join channel password\n";
		response = response.concat("/lorem opt1\n");
		response = response.concat("/ipsuim opt1 opt2 opt3\n");
		return [user.getSocket().id, prompt + "\n" + response];
	}

	// TODO working currently on join command. Here exist serveral issues that need to be debugged.
	// ISSUE feels like the client gets stuck in infinite loop after joining a room a second time (or generally joining a created room)
	private join(prompt: string, user: User, channel_id: string, channel_password: string): [string, string] {
		console.log("'JOIN' gets executed");

		let channel: Channel;

		// JOIN CHANNEL
		if (this.channelExists(channel_id) == true) {
			channel = this.getChannelByChannelId(channel_id);
			if (channel.isPrivate() == true) {
				if (channel.checkPassword(channel_password) == false)
					return [user.getSocket().id, prompt + "\n" + "Error: Wrong password"]; // if channels exists and is password protected but user inputs no or wrong password
			}
			if (channel.isMember(user) == false)
				channel.addMember(user);
			user.setActiveChannel(channel_id); // TODO somehow fetch and show the channel history (if not global) to the chat box in fronted
			return [channel_id, user.getUsername() + "entered the channel"]; // if channel exists and password check did not fail
		}

		// CREATE CHANNEL
		this.addChannel(channel_id, user, channel_password);
		channel = this.getChannelByChannelId(channel_id);
		channel.addMember(user);
		user.setActiveChannel(channel_id);
		return [user.getSocket().id, "you created the channel " + channel_id]; // if channel did not exist prior and was created now, setting the user as owner
	}
}

export class User {
	constructor(
		private readonly intraname: string,
		private readonly users: Users,
		private          socket: Socket,
		private          active_channel: string,
	){}

	private username:	string;

	private async updateUserData() {
		this.username = await this.users.getUsernameByIntra(this.intraname);
	}

	public getUsername(): string { if (this.username == undefined) this.updateUserData(); return this.username; }

	public getIntraname(): string { return this.intraname; }
	public getSocket(): Socket { return this.socket; }
	public getActiveChannel(): string { return this.active_channel; }

	public setSocket(socket: Socket) { this.socket = socket; }
	public setActiveChannel(channel: string) { this.active_channel = channel; }
}

/**
 * our object for any chatroom (dm/global/channel)
 */
export class Channel {
	constructor(
		private readonly channel_id: string,
		private owner: User,
		private password: string
	) {}

	private members: Array<User> = new Array<User>;// TODO test if socket is changed in array when user changes
	private admins:	Array<User> = new Array<User>;
	private chat_history:[user: User, message: string][];

	public initChannel() {
		this.admins.push(this.owner);
	}

	public getChannelId() { return this.channel_id; }

	public isPrivate(): boolean {
		if (this.password == undefined)
			return false;
		return true;
	}

	public isOwner(user: User): boolean {
		if (user == this.owner)
			return (true);
		return (false);
	}
	
	public addMember(user: User) {
		this.members.push(user);
		user.getSocket().join(this.channel_id);
	}

	public isAdmin(user: User): boolean {
		for (let admin of this.admins)
			if (user == admin) return (true);
		return (false);
	}

	// IDK but maybe infinite loop here?
	public isMember(user: User): boolean {
		console.log(this.members);
		this.members.forEach((member, index) => {
			if (member == user)
				return true;
		});
		return false;
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
