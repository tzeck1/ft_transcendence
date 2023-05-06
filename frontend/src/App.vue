<template>
	<div class="h-screen flex flex-col">
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
				<div class="burger-wrapper">
					<button class="burger-button" @click="toggleDropdown">
						<span class="burger-text" :class="{ 'burger-open': dropdownVisible }">&#x2630;</span>
					</button>
					<div class="dropdown-menu" v-if="dropdownVisible">
						<router-link to="/profile" v-slot="{ navigate, isActive }">
							<button class="dropdown-buttons" @click="hideDropdown(); navigate();" :class="{'active-button': isActive}" :disabled="isIntro">Profile</button>
						</router-link>
						<router-link to="/game" v-slot="{ navigate, isActive }">
							<button class="dropdown-buttons" @click="hideDropdown(); navigate();" :class="{'active-button': isActive}" :disabled="isIntro">Game</button>
						</router-link>
						<button class="dropdown-buttons" @click="hideDropdown" :disabled="isIntro">Leaderboard</button>
						<button class="dropdown-buttons" @click="hideDropdown(); loadIntro();" :disabled="isIntro">Logout</button>
					</div>
				</div>
			</nav>
		</header>
		<main class="flex-grow">
			<router-link to="/"></router-link>
			<router-view/>
		</main>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue';
	import { useRouter, useRoute } from 'vue-router';
	import { useUserStore } from './stores/UserStore';

	const router = useRouter();
	const route = useRoute();
	const dropdownVisible = ref(false);
	const store = useUserStore();
	const isIntro = computed(() => route.path === '/');

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

	function toggleDropdown() {
		dropdownVisible.value = !dropdownVisible.value;
	}

	function hideDropdown() {
		dropdownVisible.value = false;
	}

</script>

<style scoped>

@font-face {
	font-family: ibm-logo;
	src: url('./assets/mib.ttf') format('truetype');
	}

	nav {
		@apply container relative mx-auto flex items-center justify-between transition-all duration-300 ease-in-out;
	}
	.nav-buttons {
		@apply hidden lg:flex lg:opacity-100 lg:pointer-events-auto opacity-0 pointer-events-none mt-2 items-center text-2xl space-x-4;
	}

	.logo {
		@apply mt-2 ml-2 text-white text-5xl flex items-center;
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
		@apply hidden lg:flex lg:opacity-100 lg:pointer-events-auto opacity-0 pointer-events-none items-center mt-2 w-24 h-auto;
	}

	.logout-button:hover {
		@apply transform scale-110;
	}

	.burger-wrapper {
		@apply relative lg:hidden lg:opacity-0 lg:pointer-events-none;
	}

	.burger-button {
		@apply flex justify-center p-6 mt-2;
	}

	.burger-text {
		@apply text-4xl transition-all duration-300 ease-in-out;
	}

	.burger-open {
		transform: rotate(90deg);
	}

	.dropdown-menu {
		@apply absolute top-full -right-14 mt-2 py-2 w-48 bg-white bg-opacity-10 rounded-md flex flex-col space-y-1 z-10 lg:hidden;
	}

	.dropdown-buttons {
		@apply w-full p-1;
	}

</style>