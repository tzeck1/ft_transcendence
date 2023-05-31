<template>
	<div class="end_game">
		<span class="result">{{ result }}</span>
		<div class="score">
			<span class="player_score">{{ player_score }}</span>
			<span class="divider">-</span>
			<span class="enemy_score">{{ enemy_score }}</span>
		</div>
		<div class="grid">
			<div class="player">
				<img id="player-picture" class="profile-picture" :src="profile_picture"/>
				<h1 class="username-text">{{ username }}</h1>
			</div>
			<div class="enemy">
				<img id="enemy-picture" class="profile-picture" :src="enemy_picture"/>
				<h1 class="username-text">{{ enemy_name }}</h1>
			</div>
		</div>
		<div class="buttons">
			<button class="game-button" @click="playAgain">
				<span v-show="!gameStore.play_again">Play again</span>
				<span v-show="gameStore.play_again">Cancel</span>
			</button>
			<button class="quit-button" @click="quit" >Back To Profile</button>
		</div>
	</div>
</template>

<script setup lang="ts">

	import { ref, onMounted } from 'vue';
	import { useGameStore } from '@/stores/GameStore';
	import { useUserStore } from '@/stores/UserStore';
	import { storeToRefs } from 'pinia';
	import axios from 'axios';
	import router from '@/router';
	import { io } from 'socket.io-client';

	const emit = defineEmits(["start-match", "show-start"]);
	const gameStore = useGameStore();
	const userStore = useUserStore();

	var socket;

	const { username } = storeToRefs(userStore);
	const { profile_picture } = storeToRefs(userStore);
	const { enemy_name } = storeToRefs(gameStore);
	const { enemy_picture } = storeToRefs(gameStore);
	const player_score = ref('');
	const enemy_score = ref('');
	const result = ref('');

	onMounted(async () => {
		const gameData = await axios.get(`http://${location.hostname}:3000/game/getLastGame?intra=${userStore.intra}`);
		player_score.value = gameData.data.player_score;
		console.log("player_score: ", player_score);
		enemy_score.value = gameData.data.enemy_score;
		console.log("enemy_score: ", enemy_score);
		if (player_score.value > enemy_score.value)
			result.value = "Winner!";
		else
			result.value = "Loser!";
		userStore.is_endgame = true;
	});

	function playAgain() {
		if (gameStore.play_again == false) {
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
				gameStore.setPlayAgain(false);
				gameStore.setIntra(userStore.intra);
				gameStore.setEnemyName(username);
				gameStore.setEnemyPicture(pic);
				gameStore.setRoomId(room_id);
				emit('start-match');
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
			if (gameStore.mode == "")
				socket.emit("createOrJoin", userStore.intra);
			else
				socket.emit("createOrJoinMode", userStore.intra, gameStore.mode, gameStore.enemy_name, true);
			gameStore.setPlayAgain(true);
		}
		else {
			console.log("store.intra is: ", userStore.intra, "canceling queue next");
			socket.emit("cancelQueue", userStore.intra);
			userStore.socket?.emit("setIngameStatus", false);
			gameStore.setPlayAgain(false);
			gameStore.disconnectSocket();
		}
	};

	function quit() {
		gameStore.disconnectSocket();
		userStore.socket?.emit("setIngameStatus", false);
		userStore.is_endgame = false;
		router.push("/profile");
	};

</script>

<style scoped>


	.end_game {
		@apply h-full flex flex-col items-center;
	}
	.grid {
		@apply inline-flex w-full items-center justify-center gap-12 md:gap-32 lg:gap-64 2xl:gap-96 transition-all duration-300 ease-in-out;
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

	.score {
		@apply mb-24 text-6xl 2xl:text-7xl transition-all duration-300 ease-in-out;
	}

	.divider {
		@apply mx-16 2xl:mx-20 transition-all duration-300 ease-in-out;
	}

	.result {
		@apply text-8xl 2xl:text-9xl mt-32 mb-32 transition-all duration-300 ease-in-out;
	}

	.buttons {
		@apply mt-32 text-3xl;
	}

</style>