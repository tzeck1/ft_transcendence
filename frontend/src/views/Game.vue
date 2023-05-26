<template>
	<StartGame v-if="showStart" @start-match="startMatch"></StartGame>
	<Pong v-if="showMatch" @show-end="switchToEnd" class="pong"></Pong>
	<EndGame v-if="showEnd" @start-match="startMatch" @show-start="switchToStart"></EndGame>
</template>

<script setup lang="ts">
	import StartGame from '../components/Game/StartGame.vue'
	import Pong from '../components/Game/Pong.vue'
	import EndGame from '../components/Game/EndGame.vue'
	import { onMounted, ref, watch } from 'vue';
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

	// // redundancy (watch and onMounted) because watch is needed when page is reloaded on game page (new socket created),
	// // and onMounted is needed when just switching to game page
	// // when reloading on game page, chat socket is not created fast enough for onmounted to set the listeners. so watch is needed
	// watch( () => userStore.socket, (newVal, oldVal) => {
	// 	// console.log("triggered watch, userStore.socket changed to", newVal, "from", oldVal);
	// 	if (newVal != undefined) {
	// 		if (userStore.socket?.hasListeners("gameInvite") == false) {
	// 			console.log("setup listener for gameInvite");
	// 			userStore.socket!.on("gameInvite", (intra: string, other_intra: string, mode: string) => {
	// 				console.log("executing gameInvite");
	// 				gameStore.setMode(mode);
	// 				gameStore.setSocket(io(`${location.hostname}:3000/game_socket`, {autoConnect: false}));
	// 				if (gameStore.socket!.hasListeners("privatePlayReady") == false) {
	// 					console.log("setup listener for privatePlayReady");
	// 					gameStore.socket!.on("privatePlayReady", (username: string, pic: string, room_id: string) => {
	// 						console.log("executing privatePlayReady");
	// 						gameStore.setIntra(userStore.intra);
	// 						gameStore.setEnemyName(username);
	// 						gameStore.setEnemyPicture(pic);
	// 						gameStore.setRoomId(room_id);
	// 						// showCount.value = true;
	// 						// countdown();
	// 						startMatch();
	// 					});
	// 				}
	// 				gameStore.socket!.on('disconnect', function() {
	// 					console.log('game socket Disconnected');
	// 					userStore.socket!.emit("setIngameStatus", false);
	// 				});
	// 				// console.log("emitting inviteplay");
	// 				gameStore.socket!.emit("invitePlay", {intra: intra, other_intra: other_intra});
	// 			});
	// 		}
	// 	}
	// 	else
	// 		console.log("newVal was undefined in the watch function");//does this ever happen?
	// });

	onMounted(async () => {
		try {
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

		// console.log("onmounted of Game.vue");
		// if (userStore.socket?.hasListeners("gameInvite") == false) {
		// 	console.log("setup listener for gameInvite");
		// 	userStore.socket!.on("gameInvite", (intra: string, other_intra: string, mode: string) => {
		// 		console.log("executing gameInvite");
		// 		gameStore.setMode(mode);
		// 		gameStore.setSocket(io(`${location.hostname}:3000/game_socket`, {autoConnect: false}));
		// 		if (gameStore.socket!.hasListeners("privatePlayReady") == false) {
		// 			console.log("setup listener for privatePlayReady");
		// 			gameStore.socket!.on("privatePlayReady", (username: string, pic: string, room_id: string) => {
		// 				console.log("executing privatePlayReady");
		// 				gameStore.setIntra(userStore.intra);
		// 				gameStore.setEnemyName(username);
		// 				gameStore.setEnemyPicture(pic);
		// 				gameStore.setRoomId(room_id);
		// 				// showCount.value = true;
		// 				// countdown();
		// 				startMatch();
		// 			});
		// 		}
		// 		gameStore.socket!.on('disconnect', function() {
		// 			console.log('game socket Disconnected');
		// 			userStore.socket!.emit("setIngameStatus", false);
		// 		});
		// 		// console.log("emitting inviteplay");
		// 		gameStore.socket!.emit("invitePlay", {intra: intra, other_intra: other_intra});
		// 	});
		// }
	});

	function startMatch() {
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