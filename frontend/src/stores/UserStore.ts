import { defineStore } from 'pinia';

export const useUserStore = defineStore({
  id: 'UserStore',
  state: () => ({
    id: 0,
    username: '',
    profile_picture: '',
  }),
  actions: {
    setUsername(newUsername: string) {
      this.username = newUsername;
    },
    setProfilePicture(newProfilePicture: string) {
      this.profile_picture = newProfilePicture;
    },
  },
});

interface State {
  id: number;
  username: string;
  profile_picture: string;
}
