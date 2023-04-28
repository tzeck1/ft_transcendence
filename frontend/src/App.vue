<script setup lang="ts">
	import { ref, computed } from 'vue';
	import { useRouter, useRoute } from 'vue-router';
	import { useUserStore } from './stores/UserStore';

	const router = useRouter();
	const route = useRoute();

	function loadIntro() {
		router.push('/');
	}

	const store = useUserStore();
	const isIntro = computed(() => route.path === '/');
</script>

<template>
	<header>
		<nav>
			<span class="logo">PONG</span>
			<div class="nav-buttons">
						<router-link to="/profile" v-slot="{ navigate, isActive }">
							<button id="profileButton" @click="navigate" :class="{'active-button': isActive}" :disabled="isIntro">Profile</button>
						</router-link>
						<router-link to="/game" v-slot="{ navigate, isActive }">
							<button class="game-button" id="game-button" @click="navigate" :class="{'active-button': isActive}" :disabled="isIntro">Game</button>
						</router-link>
						<button :disabled="isIntro">Leaderboard</button>
				</div>
				<div class="logout-button" @click="loadIntro" :disabled="isIntro">
					<img src="./assets/logout.png" alt="Logout">
				</div>
		</nav>
	</header>
	<main>
		<router-link to="/"></router-link>
		<router-view/>
	</main>
</template>

<style scoped>

	@font-face {
		font-family: ibm-logo;
		src: url('./assets/mib.ttf') format('truetype');
	}

	header {
		@apply flex justify-between items-center p-4;
	}

	nav {
		@apply flex flex-row justify-between items-center w-full;
	}

	.logo {
		@apply inline-flex justify-center align-middle text-white text-5xl;
		font-family: 'ibm-logo';
	}

	.nav-buttons {
		@apply flex justify-center items-center flex-grow gap-6 text-2xl rounded-2xl py-6;
	}

	.active-button {
		@apply bg-white bg-opacity-10;
	}

	button:disabled:hover {
		@apply bg-transparent;
	}

	.game-button {
		@apply text-4xl;
	}

	.logout-button {
		@apply inline-flex justify-center align-middle w-24 h-auto;
	}

	.logout-button img {
		@apply inline-flex justify-center align-middle w-24 h-full;
	}

	.logout-button:hover {
		@apply transform scale-110;
	}

</style>