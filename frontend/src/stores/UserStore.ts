import { defineStore } from 'pinia';
import type { Socket } from 'socket.io-client';

export const useUserStore = defineStore({
	id: 'UserStore',
	state: () => ({
		id: +0,
		intra: '',
		username: '',
		profile_picture: '',
		tfa_enabled: false,
		socket: null as (Socket | null),
		is_endgame: false,
	}),
	actions: {
		setIntra(newIntra: string) {
			this.intra = newIntra;
		},
		setUsername(newUsername: string) {
			this.username = newUsername;
		},
		setProfilePicture(newProfilePicture: string) {
			this.profile_picture = newProfilePicture;
		},
		setTFA(state: boolean) {
			this.tfa_enabled = state;
		},
		setSocket(socket: Socket) {
			this.socket = socket;
		},
		delContent() {
			console.log("deleteContent was called");
			this.id = -1;
			this.intra = '';
			this.username = '';
			this.profile_picture = '';
			this.tfa_enabled = false;
			this.socket?.disconnect();
			this.socket = null;
			this.is_endgame = false;
		}
	},
});

interface State {
	id: number;
	intra: string,
	username: string;
	profile_picture: string;
	tfa_enabled: boolean;
	socket: Socket;
	is_endgame: boolean;
}
