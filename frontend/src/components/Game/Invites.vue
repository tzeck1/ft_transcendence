<template>
	<button class="set-button" @click="search_game()">
			<span v-show="!isReady">Ready</span>
			<span v-show="isReady">Cancel</span>
	</button>
	<div class="countdown-overlay" v-if="showCount">
		<div class="grid">
			<div class="player">
				<img id="player-picture" class="profile-picture" :src="profile_picture"/>
				<h1 class="username-text">{{ username }}</h1>
			</div>
			<div id="countdown" class="countdown">
				<span id="seconds">{{ timeLeft }}</span>
			</div>
			<div class="enemy">
				<img id="enemy-picture" class="profile-picture" :src="enemy_picture"/>
				<h1 class="username-text">{{ enemy_name }}</h1>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted, onBeforeUnmount, defineComponent, vModelCheckbox, watch } from 'vue'
	import { useUserStore } from "../../stores/UserStore"
	import { io, Socket } from 'socket.io-client';
	import { storeToRefs } from 'pinia';
	import { useGameStore } from '../../stores/GameStore';
	import Game from '../../views/Game.vue'
	import router from '@/router';

	const userStore = useUserStore();
	const gameStore = useGameStore();
	const isReady = ref(false);
	const showCount = ref(false);
	const timeLeft = ref(4);
	var socket;
	const { username } = storeToRefs(userStore);
	const { profile_picture } = storeToRefs(userStore);
	const { enemy_name } = storeToRefs(gameStore);
	const { enemy_picture } = storeToRefs(gameStore);
	const emit = defineEmits(["start-match", "show-end", "show-start"]);

	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			console.log("page is hidden!");
			if (gameStore.socket != null) {
				if (isReady.value == true){ // in queue, so get out of there and update the isLooking flag
					socket.emit("cancelQueue", userStore.intra);
					isReady.value = false;
					userStore.socket?.emit("setIngameStatus", false);
					gameStore.disconnectSocket();//maybe need to test around with order of router.push and disconnect
				} else {//user is ingame, not only in queue
					gameStore.disconnectSocket();//maybe need to test around with order of router.push and disconnect
					userStore.socket?.emit("setIngameStatus", false);
					window.location.href = '/profile';
					// router.push('/profile');
					//sending other user to profile in the onDisconnect handling function
				}
			}
		} else {//document.hidden != true
			console.log("page is visible");
		}
	});
	onMounted(() => {
		console.log("onmounted of Invites.vue");
	});

	onBeforeUnmount(() => {
		console.log("onBeforeUnmount of StartGame.vue called");
		if (isReady.value == true) {
			console.log("onbeforeunmount is also doing stuff");
			socket.emit("cancelQueue", userStore.intra);
			userStore.socket?.emit("setIngameStatus", false);
			gameStore.disconnectSocket();
			isReady.value = false;
		}
	});

	function countdown() {
		console.log("countdown was called");
		timeLeft.value--;
		if (timeLeft.value > 0)
			setTimeout(countdown, 1000);
		else
		{
			showCount.value = false;
			timeLeft.value = 4;
			console.log("emitting start-match from countdown!");
			emit('start-match');
		}
	}

	function search_game()
	{
		//establish connection
		if (!isReady.value) {
			socket = io(`${location.hostname}:3000/game_socket`);
			if (socket != undefined)
				userStore.socket?.emit("setIngameStatus", true);
			gameStore.setSocket(socket);
			socket.on('connect', function() {
				console.log('game socket Connected');
			});
			socket.on('disconnect', function() {
				console.log('game socket Disconnected');
				userStore.socket!.emit("setIngameStatus", false);
			});
			socket.on('foundOpponent', function(username: string, pic: string, room_id: string) {
				console.log("foundOpponent which also calls countdown was called");
				isReady.value = false;
				gameStore.setIntra(userStore.intra);
				gameStore.setEnemyName(username);
				gameStore.setEnemyPicture(pic);
				gameStore.setRoomId(room_id);
				showCount.value = true;
				countdown();
			});
			socket.on('noOpponent', function() {
				console.log("No fitting opponent in matchmaking, waiting...");
			});
			if (gameStore.socket?.hasListeners("sendToProfile") == false) {
				gameStore.socket!.on("sendToProfile", () => {
					console.log("calling hrefprofile on gamesocket in startgame.vue sendtoprofile");
					window.location.href = "/profile";
				});
			}
			socket.emit("createOrJoinMode", userStore.intra, gameStore.mode);
			isReady.value = true;
		}
		else {
			console.log("store.intra is: ", userStore.intra, "canceling queue next");
			socket.emit("cancelQueue", userStore.intra);
			userStore.socket?.emit("setIngameStatus", false);
			isReady.value = false;
			gameStore.disconnectSocket();
		}
	}

	const funBlockClass = computed(() => {
		return ('fun-block-selected');
	})

	const funSetClass = computed(() => {
		if (funBlockSelected.value)
			return ('fun-set-visible');
		return ('fun-set-hidden');
	})
</script>

<style scoped>

	/* @font-face {
		font-family: ibm-3270;
		src: url('./assets/3270-Regular.ttf') format('truetype');
	} */

	.set-button {
		@apply flex text-2xl bg-white bg-opacity-10 px-6 py-4 mb-2;
	}

	.set-button:hover {
		@apply text-3xl transition-all duration-300 ease-in-out;
	}

	.countdown-overlay {
		@apply fixed w-full h-full flex items-center justify-between z-50 top-0 bg-black bg-opacity-60;
	}

	.grid {
		@apply inline-flex w-full items-center justify-center gap-40;
	}


	.player, .enemy {
		@apply flex flex-col items-center;
	}

	.profile-picture {
		@apply w-40 h-40 rounded-full object-cover;
	}

	.username-text {
		@apply mt-3 text-4xl;
	}

	.countdown {
		@apply text-9xl animate-ping;
	}
</style>