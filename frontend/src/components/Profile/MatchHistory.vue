<template>
	<div class="match-history-container">
		<h2 class="title">Match History</h2>
		<div v-for="match in matches" :key="match.id" class="match-item">
			<div class="match-details">
				<div class="player-details">
					<p class="names">{{ username }}</p>
					<p>{{ match.player_score }}</p>
				</div>
				<div class="match-result">
					<p class="score">{{ match.result }}</p>
					<p>{{ match.formattedDate }}</p>
				</div>
				<div class="enemy-details">
					<p class="names">{{ match.enemy }}</p>
					<p>{{ match.enemy_score }}</p>
				</div>
			</div>
		</div>
	</div>
</template>


<script setup lang="ts">
	import { onMounted, ref, computed } from 'vue';
	import axios from 'axios';
	import { useUserStore } from '@/stores/UserStore';
	import { storeToRefs } from 'pinia';

	interface Match {
		id: number;
		enemy: string;
		player_score: number;
		enemy_score: number;
		formattedDate: Date;
		result: string;
	}

	const userStore = useUserStore();
	const matches = ref<Match[]>([]);
	const { username } = storeToRefs(userStore);
	// const result = ref('Win');

	onMounted(async () => {
		const gameData = await axios.get(`http://${location.hostname}:3000/game/getUserGames?intra=${userStore.intra}`);
		matches.value = gameData.data;
		matches.value = gameData.data.map(match => ({
			...match,
			result: computed(() => match.player_score > match.enemy_score ? 'Won' : 'Lost')
		}));
		// if (player_score.value > enemy_score.value)
		// 	result.value = "Winner!";
		// else
		// 	result.value = "Loser!";
	});
</script>

<style scoped>
	.match-history-container {
		scrollbar-width: thin;
		scrollbar-color: transparent transparent;
	}

	.title {
		@apply text-3xl font-bold text-center mb-12;
	}

	.match-item {
		@apply my-6;
		border-bottom: 2px dotted;
	}

	.match-details {
		@apply flex justify-between items-center;
	}

	.player-details, .enemy-details {
		@apply w-1/3 flex flex-col items-center;
	}

	.match-result {
		@apply w-1/3 flex flex-col justify-center items-center;
	}

	.score {
		@apply text-2xl font-bold;
	}

	.names {
		@apply text-xl;
	}


</style>
