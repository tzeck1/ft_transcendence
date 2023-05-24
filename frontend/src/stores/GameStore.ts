import { defineStore } from 'pinia';
import type { Socket } from 'socket.io-client';

export const useGameStore = defineStore({
	id: 'GameStore',
	state: () => ({
		intra: "",
		socket: null as (Socket | null),
		room_id: "",
		enemy_name: "",
		enemy_picture: "",
	}),
	actions: {
		setIntra(newIntra: string) {
			this.intra = newIntra;
		},
		setSocket(newSocket: Socket) {
			this.socket = newSocket;
		},
		setRoomId(newRoomId: string) {
			this.room_id = newRoomId;
		},
		setEnemyName(newEnemyName: string) {
			this.enemy_name = newEnemyName;
		},
		setEnemyPicture(newEnemyPicture: string) {
			this.enemy_picture = newEnemyPicture;
		},
	},
});

interface State {
	intra: string;
	socket: Socket;
	room_id: string;
	enemy_name: string;
	enemy_picture: string;
}
