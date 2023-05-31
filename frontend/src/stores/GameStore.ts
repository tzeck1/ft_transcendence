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
		mode: "",
		play_again: false,
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
		setMode(newMode: string) {
			this.mode = newMode;
		},
		setPlayAgain(again: boolean) {
			this.play_again = again;
		},
		disconnectSocket() {
			if (this.socket != null) {
				this.socket.disconnect();
				this.socket = null as (Socket | null);
			}
		},
		delContent() {
			this.intra = "";
			this.socket?.disconnect();
			this.socket = null as (Socket | null);
			this.room_id = ""
			this.enemy_name = "";
			this.enemy_picture = "";
			this.mode = "";
			this.play_again = false;
		}
	},
});

interface State {
	intra: string;
	socket: Socket;
	room_id: string;
	enemy_name: string;
	enemy_picture: string;
	mode: string;
}
