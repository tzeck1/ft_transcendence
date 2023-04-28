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
		<span class="logo">PONG</span>
		<nav>
				<div class="nav-buttons">
						<router-link to="/profile" v-slot="{ navigate, isActive }">
							<button id="profileButton" @click="navigate" :class="{'active-button': isActive}" :disabled="isIntro">Profile</button>
						</router-link>
						<router-link to="/game" v-slot="{ navigate, isActive }">
							<button id="game-button" @click="navigate" :class="{'active-button': isActive}" :disabled="isIntro">Game</button>
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

<style global>

	@font-face {
		font-family: ibm-3270;
		src: url('./assets/3270-Regular.ttf') format('truetype');
	}

	@font-face {
		font-family: ibm-logo;
		src: url('./assets/mib.ttf') format('truetype');
	}

	html, body {
		@apply flex flex-col bg-no-repeat bg-cover text-white h-full;
		font-family: 'ibm-3270', monospace;
		background-image: url("./assets/bg.gif");
	}

	body, body * {
		animation: glowing 3s infinite;
	}

	button {
		@apply bg-transparent text-4xl text-white rounded-2xl px-16 py-8;
		font-family: 'ibm-3270', monospace;
	}

	button:hover {
		@apply bg-white bg-opacity-10;
	}

	button:disabled:hover {
		@apply bg-transparent;
	}
	
	header {
		@apply flex justify-between align-middle p-4 ;
		/* display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		flex-shrink: 0; */
	}

	nav {
		@apply flex flex-row justify-between align-middle w-full;
		/* display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%; */
	}
	
	.logo {
		@apply justify-center align-middle text-white text-5xl ml-2 mt-2;
		font-family: 'ibm-logo';
	}

	.nav-buttons {
		@apply inline-flex justify-center align-middle flex-grow gap-6 text-2xl rounded-2xl px-8 py-8;
		 /* text-4xl text-white  */
		font-family: 'ibm-3270', monospace;
		/* display: flex;
		justify-content: center;
		align-items: center;
		flex-grow: 1; */
	}
	
	.active-button {
		@apply bg-white bg-opacity-10;
		/* background-color: rgba(255, 255, 255, 0.1); */
	}

	.game-button {
		@apply text-4xl;
		/* margin-left: 2vw;
		margin-right: 2vw;
		font-size: 3.5vh; */
	}

	.logout-button {
		@apply inline-flex justify-center align-middle w-24 h-full;
		/* display: flex;
		justify-content: center;
		align-items: center;
		width: 100px;
		height: 100%; */
	}

	.logout-button img {
		@apply inline-flex justify-center align-middle w-24 h-full;
	}

	.logout-button:hover {
		transform: scale(1.1);
	}

	@keyframes glowing {
		0% {
			text-shadow: 0 0 25px rgb(255, 255, 255);
		}
		50% {
			text-shadow: 0 0 25px rgb(255, 255, 255);
		}
		100% {
			text-shadow: 0 0 25px rgb(255, 255, 255);
		}
	}

	@keyframes glowing-error {
		0% {
			text-shadow: 0 0 25px rgb(255, 65, 65);
		}
		50% {
			text-shadow: 0 0 25px rgb(255, 65, 65);
		}
		100% {
			text-shadow: 0 0 25px rgb(255, 65, 65);
		}
	}

	@media (max-width: 768px) {
		html, body {
			font-size: 2vh;
		}

		button {
			padding: 3vh 6vh;
			font-size: 3vh;
		}
		
		.game-button {
			font-size: 5vh;
		}
		
		.intro h1 {
			font-size: 6vh;
		}
		
		.intro p {
			font-size: 3vh;
		}

		.intro-ascii {
			font-size: 3vh;
		}
	}
</style>
