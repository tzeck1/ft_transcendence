import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Users } from '../user/user.service';

@Injectable()
export class ChatService {
	constructor( readonly users: Users ) {}

	//		key: channel_id
	private channels: Map<string, Channel> = new Map<string, Channel>;

	//		key: intraname
	private members: Map<string, User> = new Map<string, User>;

	public addChannel(channel_id: string, client: Socket, open: boolean, password: string) {
		let user = this.getUserFromSocket(client);
		let channel = new Channel(channel_id, user, open, password);
		this.channels.set(channel_id, channel);
	}

	public async addUser(intra: string, client: Socket) {
		let user = new User(intra, this.users, client, "global");
		await user.updateUserData();
		this.members.set(intra, user);
		let global_channel = this.channels.get("global");
		global_channel.addMember(user);
		client.join("global");
		client.emit("changeInputPlaceholder", "[ Channel: global ]");
		let username = user.getUsername();
		client.to("global").emit("messageToClient", username, " has joined the channel.");
	}

	public joinChannel(client: Socket, channel_id: string) {
		let user = this.getUserFromSocket(client);
		let new_channel = this.getChannelFromId(channel_id);
		let old_channel = this.getChannelFromId(user.getActiveChannelId());
		old_channel.removeMember(user);
		client.leave(user.getActiveChannelId());
		user.setActiveChannel(channel_id);
		client.join(user.getActiveChannelId());
		if (new_channel.isOwner(user) == false)
			new_channel.addMember(user);
		if (user.getActiveChannelId().length > 7)
			client.emit("changeInputPlaceholder", "[ " + user.getActiveChannelId() + " ]");
		else
			client.emit("changeInputPlaceholder", "[ Channel: " + user.getActiveChannelId() + " ]");
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

	public reapeEmptyChannels() {
		this.channels.forEach((channel, channel_id) => {
			if (channel.isGhostChannel() == true && channel_id != "global") {
				this.channels.delete(channel_id);
				console.log("ROOM", channel_id, "GOT REAPED");
				this.reapeEmptyChannels();
			}
		})
	}


	/************************************** COMMANDS ***************************************/

	// TODO do not let the user emit an empty message_body or just spaces
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

	create(client: Socket, channel_id: string, passwd: string): [string, string, string] {
		this.reapeEmptyChannels();
		let user = this.getUserFromSocket(client);
		let recipient = user.getSocket().id;
		let message_body: string, sender: string;
		if (this.channels.get(channel_id) != undefined) {
			sender = "Error: ";
			message_body = "a channel with the name " + channel_id + " already exists.";
			return [recipient, sender, message_body];
		}
		if (channel_id.length > 16) {
			sender = "Error: ";
			message_body = "channel name is too long.";
			return [recipient, sender, message_body];
		}
		this.addChannel(channel_id, client, true, passwd);
		this.joinChannel(client, channel_id);
		sender = "Floppy: ";
		message_body = "You created and joined channel " + channel_id + " as the owner!";
		return [recipient, sender, message_body];
	}

	join(client: Socket, channel_id: string, passwd: string): [string, string, string] {
		this.reapeEmptyChannels();
		let user = this.getUserFromSocket(client);
		let recipient: string, message_body: string, sender: string;
		let channel = this.channels.get(channel_id);
		if (channel == undefined) {
			recipient = user.getSocket().id;
			sender = "Error: ";
			message_body = "no such channel exists.";
			return [recipient, sender, message_body];
		}
		if (channel_id == user.getActiveChannelId()) {
			recipient = user.getSocket().id;
			sender = "";
			message_body = "Waiting for something to happen?";
			return [recipient, sender, message_body];
		}
		if (channel.isPrivate() == true) {
			recipient = user.getSocket().id;
			sender = "Error: ";
			message_body = "this channel is private.";
			return [recipient, sender, message_body];
		}
		if (channel.isProtected() == true && passwd == undefined) {
			recipient = user.getSocket().id;
			sender = "Error: ";
			message_body = "this channel is password protected.";
			return [recipient, sender, message_body];
		}
		if (channel.isProtected() == true && channel.rightPassword(passwd) == false) {
			recipient = user.getSocket().id;
			sender = "Error: ";
			message_body = "wrong password.";
			return [recipient, sender, message_body];
		}
		this.joinChannel(client, channel_id);
		recipient = channel_id;
		sender = "";
		message_body = user.getUsername() + " has joined the channel.";
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

	// TODO if username is changed we do not change it in chat at the moment
	// solution: add antoher watch function for userStore.username in App.vue and emit an event to the server when username changes
	public async updateUserData() {
		this.username = await this.users.getUsernameByIntra(this.intraname);
	}

	public getSocket(): Socket { return this.socket; }
	public getActiveChannelId(): string { return this.active_channel; }
	public getUsername(): string { return this.username; }
	public getIntra(): string { return this.intraname; }

	public setActiveChannel(channel: string) { this.active_channel = channel; }
}


/************************************** Channel ***************************************/

export class Channel {
	constructor(
		private readonly channel_id: string,
		private owner: User,
		private open: boolean,
		private password: string
	) {}

	private members: Array<User> = [this.owner];
	private admins:	Array<User> = [this.owner];
	private chat_history:[user: User, message: string][];

	public isGhostChannel(): boolean {
		//console.log("isGhostChannel::Len: ", this.members.length, "in channel", this.channel_id);
		//this.members.forEach((user, index) => {
		//	let intra: string;
		//	if (user == undefined)
		//		intra = "undefined";
		//	else
		//		intra = user.getIntra();
		//	console.log("this.members[%d]:", index, intra);
		//});
		if (this.members.length == 0)
			return true;
		return false;
	}

	public isOwner(user: User): boolean { if (this.owner == user) return true; else return false; }

	public isPrivate(): boolean { if (this.open == true) return false; else return true; }

	public isProtected(): boolean { if (this.password != undefined) return true; else return false; }

	public rightPassword(passwd: string): boolean { if (this.password == passwd) return true; else return false; }

	public addMember(user: User) { this.members.push(user); }

	public addAdmin(user: User) { this.admins.push(user); }

	public removeMember(user: User) {
		let index = this.members.indexOf(user);
		if (index == -1) {
			console.error("internal error in removeMember::Channel");
			console.error("Was trying to remove member", user.getIntra(), "from channel", this.channel_id);
		}
		this.members.splice(index, 1);
	}
}
