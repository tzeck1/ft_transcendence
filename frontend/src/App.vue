<script setup lang="ts">
	import { ref, computed } from 'vue';
	import { useRouter, useRoute } from 'vue-router';
	import { useUserStore } from './stores/UserStore';

	const router = useRouter();
	const route = useRoute();

	function loadIntro() {
		const cookies = document.cookie.split(";");
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i];
			const eqPos = cookie.indexOf("=");
			const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
			document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
		}
		store.delContent();
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

	nav {
		@apply container mx-auto flex items-center justify-between transition-all duration-300 ease-in-out;
	}
	.nav-buttons {
		@apply hidden mt-2 md:flex items-center text-2xl space-x-4;
	}

	.logo {
		@apply mt-2 text-white text-5xl flex items-center;
		font-family: 'ibm-logo';
	}

	.active-button {
		@apply bg-white bg-opacity-10;
	}

	button:disabled:hover {
		@apply bg-transparent;
	}

	.game-button {
		@apply text-4xl;
		/* font-weight: bold; */
	}

	.logout-button {
		@apply flex items-center mt-2 w-24 h-auto;
	}

	.logout-button:hover {
		@apply transform scale-110;
	}

</style>