<template>
	<StartGame v-if="showStart" @start-match="startMatch"></StartGame>
	<Pong v-if="showMatch" @show-end="switchToEnd" class="pong"></Pong>
	<EndGame v-if="showEnd" @start-match="startMatch" @show-start="switchToStart"></EndGame>
</template>

<script setup lang="ts">
	import StartGame from '../components/Game/StartGame.vue'
	import Pong from '../components/Game/Pong.vue'
	import EndGame from '../components/Game/EndGame.vue'
	import { onBeforeMount, onMounted, onBeforeUnmount, ref, watch } from 'vue';
	import { useUserStore } from '../stores/UserStore';
	import { useGameStore } from '../stores/GameStore';
	import { io, Socket } from 'socket.io-client';
	import router from '@/router';
	import axios from 'axios';
	
	const userStore = useUserStore();
	const gameStore = useGameStore();
	const showStart = ref(true);
	const showMatch = ref(false);
	const showEnd = ref(false);

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
			console.log("mounting game.vue");
			const cookie_username = getUsernameFromCookie();
			if (!cookie_username)
			{
				router.push('/');
				return ;
			}
			if (!userStore.intra)
				userStore.setIntra(cookie_username);
			const response = await axios.get(`http://${location.hostname}:3000/auth/getUserData?intra=${userStore.intra}`);
			const data = response.data;
			userStore.setUsername(data.username);
			userStore.setProfilePicture(data.profile_picture);
			userStore.setTFA(data.tfa_enabled);
		} catch (error) {
			console.error('Error fetching user data:', error);
		}
	});

	onBeforeUnmount(() => {
		if (gameStore.socket?.connected == true) {
			console.log("onbeforeunmount of game.vue is disconnecting the socket");
			gameStore.disconnectSocket();
		}
		console.log("onbeforeunmount of game.vue is setting ingame status to false");
		userStore.socket?.emit("setIngameStatus", false);
	});

	function startMatch() {
		console.log("startMatch was called");
		showStart.value = false;
		showMatch.value = true;
		showEnd.value = false;
	}

	function switchToEnd() {
		showStart.value = false;
		showMatch.value = false;
		showEnd.value = true;
	}

	function switchToStart() {
		showStart.value = true;
		showMatch.value = false;
		showEnd.value = false;
	}

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