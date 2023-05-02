<template>
	<StartGame v-if="showStart"></StartGame>
</template>

<script setup lang="ts">
	import StartGame from '../components/Game/StartGame.vue'
	import { onMounted, ref } from 'vue';
	import { useUserStore } from '../stores/UserStore';
	import router from '@/router';
	import axios from 'axios';
	
	const store = useUserStore();
	const showStart = ref(true);

	const getUsernameFromCookie = () => {
		const cookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('username='));
		if (cookie) {
			const usernameJson = cookie.split('=')[1];
			const user_name = JSON.parse(decodeURIComponent(usernameJson));
			return user_name;
		}
		return null;
	};

	onMounted(async () => {
		try {
			const cookie_username = getUsernameFromCookie();
			if (!cookie_username)
				router.push('/');
			if (!store.intra)
				store.setIntra(cookie_username);
			const response = await axios.get(`http://${location.hostname}:3000/auth/getUserData?intra=${store.intra}`);
			const data = response.data;
			store.setUsername(data.username);
			store.setProfilePicture(data.avatarUrl);
			store.setTFA(data.tfa_enabled);
		} catch (error) {
			console.error('Error fetching user data:', error);
		}
	});
</script>


<style scoped>

	.giveUp-button {
		/* display: flex; */
		justify-content: center;
		align-items: center;
		max-width: 100px;  
		height: auto;  
	}

</style>