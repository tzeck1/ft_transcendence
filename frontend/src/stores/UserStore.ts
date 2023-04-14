import { defineStore } from "pinia";

export const useUserStore = defineStore("UserStore", {

	state: (): State =>{
		return {
			id: 0,
			username: "totoro",
			profile_picture: "",
		}
	},
	actions: {
		setUsername(newUsername: string) {
			this.username = newUsername;
		},
		setProfilePicture(newProfilePicture: string) {
			this.profile_picture = newProfilePicture;
		},
	},

})

interface State {
	id: number,
	username: string,
	profile_picture: string;
}