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
	},
});

interface State {
	id: number;
	intra: string,
	username: string;
	profile_picture: string;
	tfa_enabled: boolean;
}
