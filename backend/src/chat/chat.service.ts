import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Users } from '../user/user.service';
import { truncate } from 'fs';
import { PassThrough } from 'stream';

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
		if (old_channel.isOwner(user) == true)
			old_channel.changeOwner();
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
		if (user == undefined)
			return console.error("user in 'ChatService::message' is undefined") as undefined;
		let channel = this.channels.get(user.getActiveChannelId());
		if (channel == undefined)
			return console.error("Channel in 'ChatService::message' is undefined") as undefined;
		let sender = user.getUsername() + ": ";
		let recipient = user.getActiveChannelId();

		if (recipient.indexOf("DM") == 0) {
			sender = "[" + user.getUsername() + "]: ";
			channel.addMessageToHistory(user.getUsername(), message_body);
			client.emit("messageToClient", sender, message_body);
			return this.dm(client, channel.getOtherDmUsername(user.getIntra()), message_body, message_body);
		}
		if (channel.isMuted(user) == true) {
			recipient = client.id;
			sender = "Floppy: ";
			message_body = "You are muted in this channel for another " + channel.getMutedDuration(user) + " seconds.";
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

	// TODO make '/help (command)' possible
	help(client: Socket): [string, string, string] {
		let user = this.getUserFromSocket(client);
		let recipient = user.getSocket().id;
		let sender = "\n";
		let message_body = 				   "*┄┄┄┄┄┄┄ HELP ┄┄┄┄┄┄┄*\n";
		message_body = message_body.concat("[mandatory] (optional)\n\n");					 
		message_body = message_body.concat("/help (command) {wip}\n");
		message_body = message_body.concat("/create [name] (passwd)\n");
		message_body = message_body.concat("/join [channel] (passwd)\n");
		message_body = message_body.concat("/dm [username] (message)\n");
		message_body = message_body.concat("/leave\n");
		message_body = message_body.concat("/operator [username]\n");
		message_body = message_body.concat("/kick [username]\n");
		message_body = message_body.concat("/ban [username]\n");
		message_body = message_body.concat("/mute [username] [sec]\n");
		message_body = message_body.concat("/unmute [username]\n");
		message_body = message_body.concat("/visit [username]\n");
		message_body = message_body.concat("/invite [username]\n");
		message_body = message_body.concat("/set [option] [value]\n");
		message_body = message_body.concat("/block [username]\n");
		message_body = message_body.concat("/unset password\n");
		message_body = message_body.concat("/unblock [username]\n");
		message_body = message_body.concat("/demote [username]\n");
		message_body = message_body.concat("*┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄*\n");
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
		if (channel.isBanned(user) == true) {
			recipient = user.getSocket().id;
			sender = "Error: ";
			message_body = "you are banned from this channel.";
			return [recipient, sender, message_body];
		}
		if (channel_id == user.getActiveChannelId()) {
			recipient = user.getSocket().id;
			sender = "Floppy: ";
			message_body = "you already are in " + channel_id;
			return [recipient, sender, message_body];
		}
		if (channel.isPrivate() == true && channel.isInvited(user) == false) {
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
		sender = "Floppy: ";
		message_body = user.getUsername() + " has joined the channel.";
		return [recipient, sender, message_body];
	}

	// TODO do not allow empty message body
	dm(client: Socket, username: string, message_begin: string,  prompt: string): [string, string, string] {
		let user = this.getUserFromSocket(client);
		if (user == undefined)
			return console.error("user in 'ChatService::dm' is undefined") as undefined;
		let other_user = this.findUserFromUsername(username);
		if (other_user == undefined) {
			let recipient = client.id;
			let sender = "Floppy: ";
			let message_body = "this user does not exist (yet).";
			return [client.id, sender, message_body];
		}
		if (client.id == other_user.getSocket().id) {
			let recipient = other_user.getSocket().id;
			let sender = "Floppy: ";
			let message_body = "stop talking to yourself and start playing Pong.";
			return [recipient, sender, message_body];
		}
		if (message_begin == undefined) {
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
			user.setPendingMessage("Floppy: You slided into the DMs of " + other_user.getUsername());
			return undefined;
		}
		let channel = this.channels.get("DM" + user.getIntra() + other_user.getIntra());
		if (channel == undefined)
			channel = this.channels.get("DM" + other_user.getIntra() + user.getIntra());
		if (channel == undefined) {
			let channel_id = "DM" + user.getIntra() + other_user.getIntra();
			channel = this.addChannel(channel_id, undefined, false, undefined);
			channel.addMember(user);
			channel.addMember(other_user);
		}
		let index = prompt.indexOf(message_begin);
		let message_body = prompt.slice(index);
		channel.addMessageToHistory(user.getUsername(), message_body);
		let recipient = other_user.getSocket().id;
		let sender = "[" + user.getUsername() + "]: ";
		return [recipient, sender, message_body];
	}

	leave(client: Socket): [string, string, string] {
		let user = this.getUserFromSocket(client);
		let old_channel_id = user.getActiveChannelId();
		let old_channel = this.channels.get(old_channel_id);
		this.joinChannel(client, "global");
		if (old_channel_id.indexOf("DM") == 0)
			user.setPendingMessage("Floppy: You left " + old_channel.getOtherDmUsername(user.getIntra()) + " and slided back into gloabl.");
		else
			user.setPendingMessage("Floppy: You left " + old_channel_id);
		return undefined;
	}

	// TODO when owner leaves, a new user has to become owner
	operator(client: Socket, username: string): [string, string, string] {
		let admin = this.getUserFromSocket(client);
		if (admin == undefined)
			return console.error("Admin (user) in 'ChatService::make_admin' is undefined") as undefined;
		let channel = this.channels.get(admin.getActiveChannelId());
		if (channel == undefined)
			return console.error("Channel in 'ChatService::make_admin' is undefined") as undefined;

		if (channel.isAdmin(admin) == false) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "permission denied.";
			return [recipient, sender, message_body];
		}
		let user = this.findUserFromUsername(username);
		if (user == undefined) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "this user does not exist (yet).";
			return [recipient, sender, message_body];
		}
		if (channel.isAdmin(user) == true) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "this user is already an admin.";
			return [recipient, sender, message_body];
		}
		channel.addAdmin(user);
		let recipient = client.id;
		let sender = "Floppy: ";
		let message_body = "You made " + username + " an admin.";
		user.getSocket().emit("messageToClient", sender, "You recieved adminhood.");
		return [recipient, sender, message_body];
	}

	demote(client: Socket, username: string): [string, string, string] {
		let admin = this.getUserFromSocket(client);
		if (admin == undefined)
			return console.error("Admin (user) in 'ChatService::demote' is undefined") as undefined;
		let channel = this.channels.get(admin.getActiveChannelId());
		if (channel == undefined)
			return console.error("Channel in 'ChatService::demote' is undefined") as undefined;

		if (channel.isAdmin(admin) == false) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "permission denied.";
			return [recipient, sender, message_body];
		}
		let user = this.findUserFromUsername(username);
		if (channel.isAdmin(user) == false) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "this user is not an admin.";
			return [recipient, sender, message_body];
		}
		if (channel.isOwner(user) == true) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "you cannot demote the owner.";
			return [recipient, sender, message_body];
		}
		channel.removeAdmin(user);
		let recipient = channel.getChannelId();
		let sender = "Floppy: ";
		let message_body = user.getUsername() + " lost his adminhood.";
		return [recipient, sender, message_body];
	}

	kick(client: Socket, username: string): [string, string, string] {
		let admin = this.getUserFromSocket(client);
		if (admin == undefined)
			return console.error("Admin (user) in 'ChatService::kick' is undefined") as undefined;
		let channel = this.channels.get(admin.getActiveChannelId());
		if (channel == undefined)
			return console.error("Channel in 'ChatService::kick' is undefined") as undefined;

		if (channel.isAdmin(admin) == false) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "permission denied.";
			return [recipient, sender, message_body];
		}
		let user = this.findUserFromUsername(username);
		if (user == undefined) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "this user does not exist (yet).";
			return [recipient, sender, message_body];
		}
		if (channel.isOwner(user) == true) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "you cannot kick the owner.";
			return [recipient, sender, message_body];
		}
		this.leave(user.getSocket());
		user.setPendingMessage("You have been kicked by " + admin.getUsername());
		let recipient = channel.getChannelId();
		let sender = "Floppy: ";
		let message_body: string = user.getUsername() + " was kicked by " + admin.getUsername();
		return [recipient, sender, message_body];
	}

	ban(client: Socket, username: string): [string, string, string] {
		let admin = this.getUserFromSocket(client);
		if (admin == undefined)
			return console.error("Admin (user) in 'ChatService::ban' is undefined") as undefined;
		let channel = this.channels.get(admin.getActiveChannelId());
		if (channel == undefined)
			return console.error("Channel in 'ChatService::ban' is undefined") as undefined;

		if (channel.isAdmin(admin) == false) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "permission denied.";
			return [recipient, sender, message_body];
		}
		let user = this.findUserFromUsername(username);
		if (user == undefined) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "this user does not exist (yet).";
			return [recipient, sender, message_body];
		}
		if (channel.isOwner(user) == true) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "you cannot ban the owner.";
			return [recipient, sender, message_body];
		}
		channel.addBanned(user);
		this.leave(user.getSocket());
		user.setPendingMessage("You have been banned from channel " + channel.getChannelId() + " by " + admin.getUsername());
		let recipient = channel.getChannelId();
		let sender = "Floppy: ";
		let message_body: string = user.getUsername() + " was banned from this channel by " + admin.getUsername();
		return [recipient, sender, message_body];
	}

	mute(client: Socket, username: string, duration: number): [string, string, string] {
		let admin = this.getUserFromSocket(client);
		if (admin == undefined)
			return console.error("Admin (user) in 'ChatService::mute' is undefined") as undefined;
		let channel = this.channels.get(admin.getActiveChannelId());
		if (channel == undefined)
			return console.error("Channel in 'ChatService::mute' is undefined") as undefined;

		if (channel.isAdmin(admin) == false) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "permission denied.";
			return [recipient, sender, message_body];
		}
		let user = this.findUserFromUsername(username);
		if (user == undefined) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "this user does not exist (yet).";
			return [recipient, sender, message_body];
		}
		if (channel.isOwner(user) == true) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "you cannot mute the owner.";
			return [recipient, sender, message_body];
		}
		if (channel.isMuted(user) == true && duration == 0) {
			let recipient = channel.getChannelId();
			let sender = "Floppy: ";
			let message_body = user.getUsername() + " was unmuted by " + admin.getUsername();
			return [recipient, sender, message_body];
		}
		channel.addMuted(user, Date.now() / 1000 + duration);
		let recipient = channel.getChannelId();
		let sender = "Floppy: ";
		let message_body = user.getUsername() + " was muted for " + duration + "s by " + admin.getUsername();
		return [recipient, sender, message_body];
	}

	async visit(client: Socket, username: string): Promise<[string, string, string]> {
		let user = this.getUserFromSocket(client);
		if (user == undefined)
			return console.error("Admin (user) in 'ChatService::visit' is undefined") as undefined;
		let intra = await this.users.getIntraByUsername(username);
		if (intra == undefined) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "couldn't find user profile.";
			return [recipient, sender, message_body];
		}
		client.emit("sendToProfile", intra);
		let recipient = client.id;
		let sender = "Floppy: ";
		let message_body = "You are stalking " + username;
		return [recipient, sender, message_body];
	}

	invite(client: Socket, username: string): [string, string, string] {
		let admin = this.getUserFromSocket(client);
		if (admin == undefined)
			return console.error("Admin (user) in 'ChatService::invite' is undefined") as undefined;
		let channel = this.channels.get(admin.getActiveChannelId());
		if (channel == undefined)
			return console.error("Channel in 'ChatService::invite' is undefined") as undefined;

		if (channel.isAdmin(admin) == false) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "permission denied.";
			return [recipient, sender, message_body];
		}
		let user = this.findUserFromUsername(username);
		if (user == undefined) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "this user does not exist (yet).";
			return [recipient, sender, message_body];
		}
		channel.addInvited(user);
		user.getSocket().emit("messageToClient", "Floppy: ", "You have been invited to " + channel.getChannelId() + ". Type '/join " + channel.getChannelId() + " ' to join.");
		let recipient = client.id;
		let sender = "Floppy: ";
		let message_body = "you invited " + username + " to this channel.";
		return [recipient, sender, message_body];
	}

	// TODO some issues with password setting, not sure what exactly fails => more testing
	set(client: Socket, option: string, value: string): [string, string, string] {
		let owner = this.getUserFromSocket(client);
		if (owner == undefined)
			return console.error("owner (user) in 'ChatService::set' is undefined") as undefined;
		let channel = this.channels.get(owner.getActiveChannelId());
		if (channel == undefined)
			return console.error("Channel in 'ChatService::set' is undefined") as undefined;

		if (channel.isOwner(owner) == false) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "permission denied.";
			return [recipient, sender, message_body];
		}
		if (option == "private") {
			if (value == "true")
				channel.setOpen(false);
			else if (value == "false")
				channel.setOpen(true);
			else {
				let recipient = client.id;
				let sender = "Error: ";
				let message_body = "unknown option.";
				return [recipient, sender, message_body];
			}
			let recipient = channel.getChannelId();
			let sender = "Floppy: ";
			let message_body: string;
			if (value == "true")
				message_body = "this channel was set to private.";
			else
				message_body = "this channel was set to public.";
			return [recipient, sender, message_body];
		}
		else if (option == "password") {
			if (value.length < 3) {
				let recipient = client.id;
				let sender = "Error: ";
				let message_body = "password is too short.";
				return [recipient, sender, message_body];
			}
			let change = "changed";
			let old_password = channel.getPassword();
			if (old_password == undefined)
				change = "set";
			console.log("new password would be [%s]", value);
			channel.setPassword(value);
			let recipient = owner.getActiveChannelId();
			let sender = "Floppy: ";
			let message_body = "This channels password was " + change + " by " + owner.getUsername();
			if (value.length > 42)
				message_body = "This channels password was " + change + " by " + owner.getUsername() + "\n Good luck remembering it";
			return [recipient, sender, message_body];
		}
		return undefined;
	}

	unset(client: Socket, password: string): [string, string, string] {
		let admin = this.getUserFromSocket(client);
		if (admin == undefined)
			return console.error("Admin (user) in 'ChatService::unset' is undefined") as undefined;
		let channel = this.channels.get(admin.getActiveChannelId());
		if (channel == undefined)
			return console.error("Channel in 'ChatService::unset' is undefined") as undefined;

		if (channel.isAdmin(admin) == false) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "permission denied.";
			return [recipient, sender, message_body];
		}
		if (password == "password") {
			channel.setPassword(undefined);
			let recipient = admin.getActiveChannelId();
			let sender = "Floppy: ";
			let message_body = "This channels password was removed by " + admin.getUsername();
			return [recipient, sender, message_body];
		}
		let recipient = client.id;
		let sender = "Floppy: ";
		let message_body = "Please type exactly '/unset password' to remove the password.";
		return [recipient, sender, message_body];
	}

	async block(client: Socket, username: string): Promise<[string, string, string]> {
		let user = this.getUserFromSocket(client);
		if (user == undefined)
			return console.error("User in 'ChatService::block' is undefined") as undefined;
		let intra = await this.users.getIntraByUsername(username);
		if (intra == undefined) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "couldn't find user profile.";
			return [recipient, sender, message_body];
		}
		if (user.isAlreadyBlocked(intra) == true) {
			let recipient = client.id;
			let sender = "Floppy: ";
			let message_body = "this user is already blocked.";
			return [recipient, sender, message_body];
		}
		user.addBlockedUser(intra);
		//user.updateBlockedUsers();
		let recipient = client.id;
		let sender = "Floppy: ";
		let message_body = "you blocked " + username;
		return [recipient, sender, message_body];
	}

	async unblock(client: Socket, username: string): Promise<[string, string, string]> {
		let user = this.getUserFromSocket(client);
		if (user == undefined)
			return console.error("User in 'ChatService::unblock' is undefined") as undefined;
		let intra = await this.users.getIntraByUsername(username);
		if (intra == undefined) {
			let recipient = client.id;
			let sender = "Error: ";
			let message_body = "couldn't find user profile.";
			return [recipient, sender, message_body];
		}
		if (user.isAlreadyBlocked(intra) == false) {
			let recipient = client.id;
			let sender = "Floppy: ";
			let message_body = "this user is not blocked by you (yet).";
			return [recipient, sender, message_body];
		}
		user.removeBlockedUser(intra);
		//user.updateBlockedUsers();
		let recipient = client.id;
		let sender = "Floppy: ";
		let message_body = "you unblocked " + username;
		return [recipient, sender, message_body];
	}
}

	// gameInvite(client: Socket, username: string): [string, string, string] {
	// 	//ping/pong handshake
	// 	// TODO think about how to hold this request open
	// }

/************************************** USER ***************************************/

export class User {
	constructor(
		private readonly intraname: string,
		private readonly users: Users,
		private          socket: Socket,
		private          active_channel: string,
	){}

	private username: string;
	private pending_message: string = undefined;
	private blocked_users: string[];

	public async updateUserData() {
		//let old_username = this.username;
		this.username = await this.users.getUsernameByIntra(this.intraname);
		//if (this.username != old_username)
		//	this.updateBlockedUsers();
		this.blocked_users = await this.users.getBlocksByIntra(this.intraname);
	}

	//public updateBlockedUsers() {
	//	let blocked_usernames = this.getBlockedUsernames();
	//	this.socket.emit("updateBlockedUsers", blocked_usernames);
	//}

	//public getBlockedUsernames(): string[] {
	//	let blocked_usernames: string[] = (undefined);
	//	this.blocked_users.forEach( async (intra) => {
	//		let username = await this.users.getUsernameByIntra(intra);
	//		blocked_usernames.push(username);
	//	});
	//	return blocked_usernames;
	//}

	public getSocket(): Socket { return this.socket; }
	public getActiveChannelId(): string { return this.active_channel; }
	public getUsername(): string { this.updateUserData(); return this.username; }
	public getIntra(): string { return this.intraname; }
	public getPendingMessage(): string { return this.pending_message; }
	public getBlocks(): string[] { this.updateUserData(); return this.blocked_users; }

	public setActiveChannel(channel: string) { this.active_channel = channel; }
	public setPendingMessage(message: string) { this.pending_message = message; }

	public addBlockedUser(intra: string) {
		this.updateUserData();
		this.blocked_users.push(intra);
		this.users.setBlocks(this.intraname, this.blocked_users);
	}

	public removeBlockedUser(intra: string){
		this.updateUserData();
		let index = this.blocked_users.indexOf(intra);
		this.blocked_users.splice(index, 1);
		this.users.setBlocks(this.intraname, this.blocked_users);
	}

	public isAlreadyBlocked(intra: string): boolean { if (this.blocked_users.indexOf(intra) == -1) return false; else return true;}
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
	private muted: [user: User, epoch_seconds: number][] = [[undefined, 0]];
	private banned: Array<User> = [undefined];// NOTE is this the correct datatype? or User[]?
	private invited: Array<User> = [undefined];

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

	public getPassword(): string { return this.password; }

	public setPassword(passwd: string) { this.password = passwd; }

	public isOwner(user: User): boolean { if (this.owner == user) return true; else return false; }

	public isAdmin(user: User): boolean { if (this.admins.find(element => element == user) != undefined) return true; return false; }

	public isPrivate(): boolean { if (this.open == true) return false; else return true; }

	public isProtected(): boolean { if (this.password != undefined) return true; else return false; }

	public isBanned(user: User): boolean { if (this.banned.find(element => element == user) != undefined) return true; return false; }

	public isMuted(user: User): boolean {
		let muted: [User, number] = this.muted.find(element => element[0] == user);
		if (muted == undefined)
			return false;
		if (muted[1] < Date.now() / 1000) {
			let index = this.muted.indexOf(muted);
			this.muted.splice(index, 1);
			return false;
		}
		return true;
	}

	public isInvited(user: User): boolean { if (this.invited.find(element => element == user) != undefined) return true; return false; }

	public getChannelId(): string { return this.channel_id; }

	public rightPassword(passwd: string): boolean { if (this.password == passwd) return true; else return false; }

	public addMember(user: User) { this.members.push(user); }

	/**
	 * Adds user to admins array if not already present.
	 */
	public addAdmin(user: User) { 
		if (this.admins.find(element => element == user) == undefined)
			this.admins.push(user);
	}

	/**
	 * Adds user to muted array if not already present.
	 * If already present, updates the time to epoch_seconds.
	 */
	public addMuted(user: User, epoch_seconds: number) {
		// for (let entry of this.muted) {
		// 	if (entry[0] == user) {
		// 		entry[1] = epoch_seconds;
		// 		return;
		// 	}
		// 	// TODO maybe check if entry[1] < Date.now(), and remove entry if true
		// }

	 	//this or the for loop above?
	 	let entry = this.muted.find(element => element[0] == user);
	 	if (entry == undefined)
	 		this.muted.push([user, epoch_seconds]);
	 	else
	 		entry[1] = epoch_seconds;
	}

	public getMutedDuration(user: User): number {
		let muted: [User, number] = this.muted.find(element => element[0] == user);
		if (muted == undefined)
			return 0;
		let diff = muted[1] - Date.now() / 1000;
		return Math.trunc(diff);
	}

	/**
	 * Adds user to banned array if not already present.
	 */
	public addBanned(user: User) {
		if (this.banned.find(element => element == user) == undefined)
			this.banned.push(user);
	}

	/**
	 * Adds user to invited array if not already present.
	 */
	public addInvited(user: User) {
		if (this.invited.find(element => element == user) == undefined)
			this.invited.push(user);
	}

	public removeMember(user: User) {
		let index = this.members.indexOf(user);
		this.members.splice(index, 1);
	}

	public removeAdmin(user: User) {
		let index = this.admins.indexOf(user);
		this.admins.splice(index, 1);
	}

	public setOpen(open: boolean) { this.open = open; }

	public changeOwner() {
		let recipient: User;
		let sender = "Floppy: ";
		let message_body = "You are now the owner of this channel.";
		let old_owner = this.owner;
		for (let admin of this.admins) {
			if (admin != this.owner && admin.getActiveChannelId() == this.channel_id) {
				this.owner = admin;
				recipient = admin;
				break;
			}
		}
		if (this.owner == old_owner) {
			for (let member of this.members) {
				if (member != this.owner && member.getActiveChannelId() == this.channel_id) {
					this.owner = member;
					this.admins.push(member);
					recipient = member;
					break;
				}
			}
		}
		if (this.owner == old_owner)
			this.owner = undefined;
		else
			recipient.getSocket().emit("messageToClient", sender, message_body);
	}
}
