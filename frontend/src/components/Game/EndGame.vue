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
			<button class="game-button" @click="playAgain" >Play Again</button>
			<button class="quit-button" @click="quit" >Back To Start</button>
		</div>
	</div>
</template>

<script setup lang="ts">

	import { ref, onMounted } from 'vue';
	import { useGameStore } from '@/stores/GameStore';
	import { useUserStore } from '@/stores/UserStore';
	import { storeToRefs } from 'pinia';
	import axios from 'axios';

	const emit = defineEmits(["start-match", "show-start"]);
	const gameStore = useGameStore();
	const userStore = useUserStore();

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
		emit("start-match");
	};

	function quit() {
		gameStore.disconnectSocket();
		userStore.socket?.emit("setIngameStatus", false);
		userStore.is_endgame = false;
		window.location.href = "/profile";
		// emit("show-start");
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