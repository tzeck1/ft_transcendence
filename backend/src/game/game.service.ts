import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Users } from '../user/user.service';

@Injectable()
export class GameService {
	constructor(
		readonly users: Users,
	) {}
	// async matchMake(client: Socket, searching_intra: string, intra_clients: Map<string, Socket>): Promise<Socket> {
	// 	for (let [key, element] of intra_clients) {
	// 		if (key != searching_intra 
	// 			&& (await this.users.getScore(searching_intra) > await this.users.getScore(key) - 20 
	// 			||  await this.users.getScore(searching_intra) < await this.users.getScore(key) + 20)) {
	// 			client.leave("lobby");
	// 			element.leave("lobby");
	// 			client.join(element.id);
	// 			// this.gameGateway.server.to(element.id).emit("foundOpponent", await this.users.getUsername(await this.users.getId(searching_intra)), await this.users.getPicture(searching_intra));
	// 			// client.broadcast.emit(element.id, "foundOpponent", await this.users.getUsername(await this.users.getId(searching_intra)), await this.users.getPicture(searching_intra));
	// 			return element;
	// 		}// TODO move the lines above in extra function, call for both players
	// 	}
	// 	client.emit("noOpponent");
	// 	return undefined;
	// }
}
