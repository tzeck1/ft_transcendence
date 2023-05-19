import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Users } from '../user/user.service';
import { channel } from 'diagnostics_channel';

@Injectable()
export class ChatService {
	constructor( readonly users: Users ) {}

	//		key: channel_id
	private channels: Map<string, Channel> = new Map<string, Channel>;

	//		key: intraname
	private members: Map<string, User> = new Map<string, User>;

	public addChannel(channel_id: string, client: Socket, open: boolean, password: string): Channel {
		let user = this.getUserFromSocket(client);
		let channel = new Channel(channel_id, user, open, password);
		this.channels.set(channel_id, channel);
		return channel;
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
		if (old_channel.getChannelId().indexOf("DM") != 0)
			old_channel.removeMember(user);
		client.leave(user.getActiveChannelId());
		user.setActiveChannel(channel_id);
		client.join(user.getActiveChannelId());
		if (new_channel.isOwner(user) == false && new_channel.getChannelId().indexOf("DM") != 0)
			new_channel.addMember(user);
		if (new_channel.getChannelId().indexOf("DM") == 0)
			client.emit("changeInputPlaceholder", "[ DM: " + new_channel.getOtherDmUsername(user.getIntra()) + " ]", user.getActiveChannelId());
		else if (user.getActiveChannelId().length > 8)
			client.emit("changeInputPlaceholder", "[ " + user.getActiveChannelId() + " ]", user.getActiveChannelId());
		else
			client.emit("changeInputPlaceholder", "[ Channel: " + user.getActiveChannelId() + " ]", user.getActiveChannelId());
	}

	public getUserFromSocket(client: Socket): User {
		for (let [intra, user] of this.members) {
			if (user.getSocket() == client)
				return user;
		}
		return undefined;
	}

	public getIntraFromSocket(client: Socket): string {
		for (let [intra, user] of this.members) {
			if (user.getSocket() == client)
				return intra;
		}
		return undefined;
	}

	public findUserFromUsername(username: string): User {
		for (let [intra, user] of this.members) {
			if (user.getUsername() == username) {
				return user;
			}
		}
		return undefined;
	}

	public getChannelFromId(channel_id_to_find: string) {
		for (let [channel_id, channel] of this.channels) {
			if (channel_id_to_find == channel_id)
				return channel;
		}
		return undefined;
	}

	public reapeEmptyChannels() {
		this.channels.forEach((channel, channel_id) => {
			if (channel.isGhostChannel() == true && channel_id != "global" && (channel_id.indexOf("DM") != 0)) {
				this.channels.delete(channel_id);
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

		let channel = this.getChannelFromId(recipient);
		if (recipient.indexOf("DM") == 0) {
			sender = "[" + user.getUsername() + "]: ";
			channel.addMessageToHistory(user.getUsername(), message_body);
			client.emit("messageToClient", sender, message_body);
			return this.dm(client, channel.getOtherDmUsername(user.getIntra()), message_body);
		}
		channel.addMessageToHistory(user.getUsername(), message_body);
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
		message_body = message_body.concat("/dm [username] (message)\n");
		return [recipient, sender, message_body];
	}

	create(client: Socket, channel_id: string, passwd: string): [string, string, string] {
		this.reapeEmptyChannels();
		let user = this.getUserFromSocket(client);
		let recipient = user.getSocket().id;
		let message_body: string, sender: string;
		if (channel_id.indexOf("DM") == 0) {
			recipient = client.id;
			sender = "Error: ";
			message_body = "you cannot create channels that start with 'DM'.";
			return [recipient, sender, message_body];
		}
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
		if (channel_id.length < 3) {
			sender = "Error: ";
			message_body = "channel name is too short.";
			return [recipient, sender, message_body];
		}
		if (passwd != undefined && passwd.length < 3) {
			sender = "Error: ";
			message_body = "password is too short.";
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
		if (channel_id.indexOf("DM") == 0) {
			recipient = client.id;
			sender = "Error: ";
			message_body = "you cannot join channels that start with 'DM'.";
			return [recipient, sender, message_body];
		}
		let channel = this.channels.get(channel_id);
		if (channel == undefined) {
			recipient = user.getSocket().id;
			sender = "Error: ";
			message_body = "no such channel exists.";
			return [recipient, sender, message_body];
		}
		if (channel_id == user.getActiveChannelId()) {
			recipient = user.getSocket().id;
			sender = "Floppy: ";
			message_body = "you already are in " + channel_id;
			return [recipient, sender, message_body];
		}
		if (channel.isPrivate() == true) {
			// TODO in here check for invited array
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

	// TODO do not allow empty message body
	// TODO mesages in form of '/dm username message' do not get put into any channels history
	dm(client: Socket, username: string, message_body: string): [string, string, string] {
		let user = this.getUserFromSocket(client);
		let recipient: string, sender: string;
		let other_user = this.findUserFromUsername(username);
		if (other_user == undefined) {
			sender = "Floppy: ";
			message_body = "this user does not exist (yet).";
			return [client.id, sender, message_body];
		}
		if (client.id == other_user.getSocket().id) {
			recipient = other_user.getSocket().id;
			sender = "Floppy: ";
			message_body = "stop talking to yourself and start playing Pong.";
			return [recipient, sender, message_body];
		}
		if (message_body == undefined) {
			let channel = this.channels.get("DM" + user.getIntra() + other_user.getIntra());
			if (channel == undefined)
				channel = this.channels.get("DM" + other_user.getIntra() + user.getIntra());
			if (channel == undefined) {
				let channel_id = "DM" + user.getIntra() + other_user.getIntra();
				let channel = this.addChannel(channel_id, undefined, false, undefined);
				channel.addMember(user);
				channel.addMember(other_user);
				this.joinChannel(client, channel_id);
			}
			else
				this.joinChannel(client, channel.getChannelId());
			recipient = client.id;
			sender = "Floppy: ";
			message_body = "you slided into the DMs of " + other_user.getUsername();
			return [recipient, sender, message_body];
		}
		recipient = other_user.getSocket().id;
		sender = "[" + user.getUsername() + "]: ";
		return [recipient, sender, message_body];
	}

	leave(client: Socket): [string, string, string] {
		let user = this.getUserFromSocket(client);
		let old_channel_id = user.getActiveChannelId();
		let old_channel = this.channels.get(old_channel_id);
		this.joinChannel(client, "global");
		let recipient = client.id;
		let sender = "";
		let message_body: string;
		if (old_channel_id.indexOf("DM") == 0)
			message_body = "You left the DMs of " + old_channel.getOtherDmUsername(user.getIntra());
		else
			message_body = "You left " + old_channel_id;
		return [recipient, sender, message_body];
	}

	// make_admin(client: Socket, username: string, channel_id: string): [string, string, string] {
	// 	let admin = this.getUserFromSocket(client);
	// 	let channel = this.channels.get(channel_id);

	// 	if (admin == undefined || channel == undefined)
	// 		return;
	// 	if (channel.isAdmin(admin) == false)
	// 		return;
	// 	let user = this.findUserFromUsername(username);
	// 	if (user != undefined && channel.isAdmin(user) == false) {
	// 		channel.addAdmin(user);
	// 		// TODO emit here user became admin
	// 		return;//with message to command-user
	// 	}

	// 	let recipient = client.id;
	// 	let sender = "";
	// 	let message_body: string = "failed to make " + username + " an admin";
	// 	return [recipient, sender, message_body];//return error to command-user
	// }

	// kick(client: Socket, username: string, channel_id: string): [string, string, string] {
	// 	let admin = this.getUserFromSocket(client);
	// 	let channel = this.channels.get(channel_id);

	// 	if (admin == undefined || channel == undefined)
	// 		return;
	// 	if (channel.isAdmin(admin) == false)
	// 		return;
	// 	let user = this.findUserFromUsername(username);
	// 	if (user != undefined && channel.isOwner(user) == false) {
	// 		// TODO make user leave channel
	// 		// TODO emit to kicked player
	// 		return;// TODO return success message to command-user
	// 	}
	// 	let recipient = client.id;
	// 	let sender = "";
	// 	let message_body: string = user.getUsername() + " was kicked by " + client;
	// 	return [recipient, sender, message_body];// TODO return error message to command-user
	// }

	// ban(client: Socket, username: string, channel_id: string): [string, string, string] {
	// 	let admin = this.getUserFromSocket(client);
	// 	let channel = this.channels.get(channel_id);

	// 	if (admin == undefined || channel == undefined)
	// 		return;
	// 	if (channel.isAdmin(admin) == false)
	// 		return;
	// 	let user = this.findUserFromUsername(username);
	// 	if (user != undefined && channel.isOwner(user) == false) {
	// 		channel.addBanned(user);
	// 		// TODO emit to banned player
	// 		return;// TODO return success message to command-user
	// 	}
	// 	let recipient = client.id;
	// 	let sender = "";
	// 	let message_body: string = "failed to ban " + user.getUsername();
	// 	return;// TODO return error message to command-user
	// }

	// mute(client: Socket, username: string, duration: number, channel_id: string): [string, string, string] {
	// 	//check if client is admin && username is not owner
	// 	//add username's User to mute array with Date.now() + duration
	// 	//addMuted()
	// 	let admin = this.getUserFromSocket(client);
	// 	let channel = this.channels.get(channel_id);

	// 	if (admin == undefined || channel == undefined)
	// 		return;
	// 	if (channel.isAdmin(admin) == false)
	// 		return;
	// 	let user = this.findUserFromUsername(username);
	// 	if (user != undefined && channel.isOwner(user) == false)
	// 		channel.addMuted(user, Date.now() / 1000 + duration);
		
	// 	// TODO return
	// }

	// channelInvite(client: Socket, username: string): [string, string, string] {
	// 	//check if client is admin
	// 	//add username's User to invited Array
	// 	//send request to username's User ("use '/join <channel_id> to accept invitation from <invitee>")
	// 	//addInvited()
	// }


	// // TODO check if it doesn't make more sense to put all 3 password functions in one function

	// setPassword(client: Socket, password: string): [string, string, string] {
	// 	//check if client is owner
	// 	//channel.changePassword(password);
	// }
	// changePassword(client: Socket, new_password: string): [string, string, string] {
	// 	//check if client is owner
	// 	//channel.changePassword(new_password);
	// }
	// removePassword(client: Socket): [string, string, string] {
	// 	//check if client is owner
	// 	//channel.changePassword(undefined);
	// }

	// gameInvite(client: Socket, username: string): [string, string, string] {
	// 	//ping/pong handshake
	// 	// TODO think about how to hold this request open
	// }

	// visit(client: Socket, username: string): [string, string, string] {
	// 	//redirect client to username's profile page
	// }

	// block(client: Socket, username: string): [string, string, string] {
	// 	//add username's User to client's list of blocked users
	// }
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
	public getUsername(): string { this.updateUserData(); return this.username; }
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
	private chat_history: [username: string, message: string][] = [["", ""]];;
	// private muted: [user: User, epoch_seconds: number][] = [[undefined, 0]];
	// private banned: Array<User> = [undefined];// NOTE is this the correct datatype? or User[]?
	// private invited: Array<User> = [undefined];

	public isGhostChannel(): boolean {
		if (this.members.length == 0)
			return true;
		return false;
	}
	
	public getOtherDmUsername(intra: string): string {
		for (let user of this.members){
			if (user != undefined && user.getIntra() != intra)
				return user.getUsername();
		}
		return undefined;
	}

	public addMessageToHistory(sender: string, message_body: string) {
		if (this.chat_history.length == 42)
			this.chat_history.shift();
		this.chat_history.push([sender + ": ", message_body]);
	}

	public getChatHistory(): [string, string][] {
		return this.chat_history
	};

	public isOwner(user: User): boolean { if (this.owner == user) return true; else return false; }

	public isAdmin(user: User): boolean { if (this.admins.find(element => element == user) != undefined) return true; return false; }

	public isPrivate(): boolean { if (this.open == true) return false; else return true; }

	public isProtected(): boolean { if (this.password != undefined) return true; else return false; }

	public getChannelId(): string { return this.channel_id; }

	public rightPassword(passwd: string): boolean { if (this.password == passwd) return true; else return false; }

	// public changePassword(new_password: string) { this.password = new_password; }

	public addMember(user: User) { this.members.push(user); }

	// /**
	//  * Adds user to admins array if not already present.
	//  */
	// public addAdmin(user: User) { 
	// 	if (this.admins.find(element => element == user) == undefined)
	// 		this.admins.push(user);
	// }

	// /**
	//  * Adds user to muted array if not already present.
	//  * If already present, updates the time to epoch_seconds.
	//  */
	// public addMuted(user: User, epoch_seconds: number) {
	// 	// for (let entry of this.muted) {
	// 	// 	if (entry[0] == user) {
	// 	// 		entry[1] = epoch_seconds;
	// 	// 		return;
	// 	// 	}
	// 	// 	// TODO maybe check if entry[1] < Date.now(), and remove entry if true
	// 	// }

	// 	//this or the for loop above?
	// 	let entry = this.muted.find(element => element[0] == user);
	// 	if (entry == undefined)
	// 		this.muted.push([user, epoch_seconds]);
	// 	else
	// 		entry[1] = epoch_seconds;
	// }

	// /**
	//  * Adds user to banned array if not already present.
	//  */
	// public addBanned(user: User) {
	// 	if (this.banned.find(element => element == user) == undefined)
	// 		this.banned.push(user);
	// }

	// /**
	//  * Adds user to invited array if not already present.
	//  */
	// public addInvited(user: User) {
	// 	if (this.invited.find(element => element == user) == undefined)
	// 		this.invited.push(user);
	// }

	public removeMember(user: User) {
		let index = this.members.indexOf(user);
		this.members.splice(index, 1);
	}
}
