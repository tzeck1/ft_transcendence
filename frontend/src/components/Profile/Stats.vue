<template>
	<div class="statistics-container">
		<h2 class="title">Statistics</h2>
		<div class="stats-carousel">
			<canvas class="bar" v-show="currentSlide === 1" id="BarChart"></canvas>
			<canvas class="pie" v-show="currentSlide === 2" id="PieChart"></canvas>
			<canvas class="line" v-show="currentSlide === 3" id="LineChart"></canvas>
			<!-- <div class="slide pieChart" v-show="currentSlide === 1">This could be a pie chart</div> -->
			<!-- <div class="slide barChart" v-show="currentSlide === 2">This could be a bar chart</div> -->
			<!-- <div class="slide rank " v-show="currentSlide === 3">3</div> -->
		</div>
		<div class="slide-buttons">
			<button v-for="(slide, index) in slides" :key="index" 
			class="slide-button" @click="setSlide(index + 1)"
			:style="{ opacity: currentSlide === index + 1 ? 1 : 0.3 }">&#8226;
		</button>
		</div>
	</div>
</template>

<script setup lang="ts">

	import { ref, onMounted, nextTick } from 'vue';
	import { Chart, registerables } from 'chart.js';
	import axios from 'axios';
	import { useUserStore } from '@/stores/UserStore';
	import { useRoute } from 'vue-router';

	const route = useRoute();
	const currentSlide = ref(1);
	const slides = ref([1, 2, 3]);
	const wins = ref(0);
	const losses = ref(0);
	const paddle_hits_e = ref(0);
	const paddle_hits_m = ref(0);
	const paddle_miss = ref(0);
	const userStore = useUserStore();
	let games;

	function nextSlide(direction: number) {
		if (currentSlide.value < 3)
			currentSlide.value += direction;
	}

	function prevSlide(direction: number) {
		if (currentSlide.value > 1)
			currentSlide.value -= direction;
	}

	function setSlide(index: number) {
		currentSlide.value = index;
	}

	Chart.register(...registerables);

	const fetchData = async () => {
		let intra = '';
		if (!route.params.username) {
			intra = userStore.intra;
		}
		else {
			intra = route.params.username.toString();
		}
		const winData = await axios.get(`http://${location.hostname}:3000/users/getUser?intra=${intra}`);
		const paddleData = await axios.get(`http://${location.hostname}:3000/users/getPaddleStats?intra=${intra}`);
		const gameData = await axios.get(`http://${location.hostname}:3000/game/getUserGamesAsc?intra=${intra}`);
		games = gameData.data;
		wins.value = winData.data.games_won;
		losses.value = winData.data.games_lost;
		paddle_hits_e.value = paddleData.data.paddle_hits_e;
		paddle_hits_m.value = paddleData.data.paddle_hits_m;
		paddle_miss.value = paddleData.data.paddle_miss;
		initPie();
		initBar();
		initLine();
	};

	const initPie = () => {
		const ctx = document.getElementById('PieChart') as HTMLCanvasElement;
		const myChart = new Chart(ctx, {
			type: 'pie',
			data: {
				labels: ['Wins', 'Losses'],
				datasets: [{
					data: [wins.value, losses.value],
					backgroundColor: [
						'rgba(52, 211, 153, 0.2)',  // Lighter white
						'rgba(248, 113, 113, 0.2)'   // Darker white
					],
					borderWidth: 0
				}]
			},
			options: {
				responsive: true,
			}
		});
	};

	const initBar = () => {
		const ctx = document.getElementById('BarChart') as HTMLCanvasElement;
		const myChart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: ['Paddle Hit Edge', 'Paddle Hit Middle', 'Paddle Miss'],
			datasets: [
				{
					label: 'Paddle Hits',
					data: [paddle_hits_e.value, paddle_hits_m.value, paddle_miss.value],
					backgroundColor: 
					[
						'rgba(52, 211, 153, 0.2)',
						'rgba(251, 191, 36, 0.2)',
						'rgba(248, 113, 113, 0.2)',
					],
					borderWidth: 1,
				}]
			},
			options: {
				responsive: true,
				plugins: {
					legend: {
						display: false
					}
				},
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
	};

	const initLine = () => {
		const ctx = document.getElementById('LineChart') as HTMLCanvasElement;
		const labels = games.map((game, index) => game.formattedDate );
		let rank = 0;
		const data = games.map(game => {
			if(game.player_score > game.enemy_score) {
				rank++;
			} else {
				if (rank != 0)
					rank--;
			}
			return rank;
		});

		const myChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [{
					label: 'Rank',
					data: data,
					fill: false,
					backgroundColor: 'rgba(52, 211, 153, 0.2)',
					borderColor: 'rgba(52, 211, 153, 0.2)',
					// borderColor: 'rgb(75, 192, 192)',
					tension: 0.1
				}]
			},
			options: {
				responsive: true,
				plugins: {
					legend: {
						display: true
					}
				},
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
	};

	onMounted(() => {
		fetchData();
	});


</script>

<style scoped>

.statistics-container {
	@apply  hidden lg:flex flex-col items-center justify-center;
	scrollbar-width: thin;
	scrollbar-color: transparent transparent;
}

.title {
	@apply text-3xl font-bold text-center mb-3;
}

.stats-carousel {
	@apply flex justify-center items-center w-11/12 h-full p-4;
}

.slide-buttons {
	@apply inline-flex gap-6;
}

.slide-button {
	@apply rounded-full flex justify-center items-center px-2 py-0 text-4xl;
}

.slide-button:hover {
	@apply bg-transparent;
}

.pie {
	/* @apply w-4 h-4; */
}

</style>