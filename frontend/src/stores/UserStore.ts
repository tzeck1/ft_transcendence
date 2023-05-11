import { defineStore } from 'pinia';

export const useUserStore = defineStore({
	id: 'UserStore',
	state: () => ({
		id: +0,
		intra: '',
		username: '',
		profile_picture: '',
		tfa_enabled: false,
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
		delContent() {
			this.id = -1;
			this.intra = '';
			this.username = '';
			this.profile_picture = '';
			this.tfa_enabled = false;
		}
	},
});

interface State {
	id: number;
	intra: string,
	username: string;
	profile_picture: string;
	tfa_enabled: boolean;
}
