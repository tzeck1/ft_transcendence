<template>
	<div class="match-history-container">
		<h2 class="title">Match History</h2>
		<div v-for="(match, index) in matches" :key="match.id" :class="{'highlight': index % 2 === 0}" class="match-item">
			<div class="match-details">
				<div class="player-details">
					<p class="names">{{ match.player }}</p>
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
	import { useRoute } from 'vue-router';
	import router from '@/router';

	interface Match {
		id: number;
		player: string;
		enemy: string;
		player_score: number;
		enemy_score: number;
		formattedDate: Date;
		result: string;
	}

	const userStore = useUserStore();
	const matches = ref<Match[]>([]);
	const { username } = storeToRefs(userStore);
	const route = useRoute();
	// const result = ref('Win');

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
		const cookie_username = getUsernameFromCookie();
		if (!cookie_username)
		{
			router.push('/'); //do we need to return after that?
			return ;
		}
		if (!userStore.intra)
			userStore.setIntra(cookie_username);
		let intra = '';
		if (!route.params.username) {
			intra = userStore.intra;
		}
		else {
			intra = route.params.username.toString();
		}
		console.log("matchhistory for: ", intra);
		const gameData = await axios.get(`http://${location.hostname}:3000/game/getUserGames?intra=${intra}`);
		matches.value = gameData.data;
		matches.value = gameData.data.map(match => ({
			...match,
			result: computed(() => match.player_score > match.enemy_score ? 'Won' : 'Lost')
		}));
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
		@apply py-2;
		/* border-bottom: 2px dotted; */
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

	.highlight {
		@apply bg-white bg-opacity-10;
	}

</style>
