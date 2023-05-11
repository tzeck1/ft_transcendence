import { defineStore } from 'pinia';
import type { Socket } from 'socket.io-client';

export const useGameStore = defineStore({
	id: 'GameStore',
	state: () => ({
		intra: "",
		socket: null as (Socket | null),
		enemy_name: "",
		enemy_picture: "",
		room_id: "",
	}),
	actions: {
		setIntra(newIntra: string) {
			this.intra = newIntra;
		},
		setSocket(newSocket: Socket) {
			this.socket = newSocket;
		},
		setEnemyName(newEnemyName: string) {
			this.enemy_name = newEnemyName;
		},
		setEnemyPicture(newEnemyPicture: string) {
			this.enemy_picture = newEnemyPicture;
		},
		setRoomId(newRoomId: string) {
			this.room_id = newRoomId;
		}
	},
});

interface State {
	intra: string;
	socket: Socket;
	enemy_name: string;
	enemy_picture: string;
	room_id: string;
}
