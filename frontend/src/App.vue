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
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}
	
	@font-face {
		font-family: ibm-3270;
		src: url('./assets/3270-Regular.ttf') format('truetype');
	}

	@font-face {
		font-family: ibm-logo;
		src: url('./assets/mib.ttf') format('truetype');
	}

	html, body {
		font-family: 'ibm-3270', monospace;
		background-image: url("./assets/bg.gif");
		background-size: cover;
		background-repeat: no-repeat;
		color: white;
		height: 100%;
		display: flex;
		flex-direction: column;
		font-size: 1vh;
	}

	body, body * {
		animation: glowing 3s infinite;
	}

	button {
		background-color: transparent;
		color: rgb(255, 255, 255);
		border: 1px solid rgba(255, 255, 255, 0);
		border-radius: 25px;
		padding: 2vh 5vh;
		cursor: pointer;
		outline: none;
		font-size: 2vh;
		font-family: 'ibm-3270', monospace;
	}

	button:disabled:hover {
		background-color: transparent;
	}
	
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		flex-shrink: 0;
	}

	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}
	
	.logo {
		display: flex;
		font-family: ibm-logo;
		font-size: 3rem;
		margin-left: 3vw;
	}

	.nav-buttons {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-grow: 1;
	}
	
	button:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
	
	.active-button {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.game-button {
		margin-left: 2vw;
		margin-right: 2vw;
		font-size: 3.5vh;
	}

	.logout-button {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100px;
		height: 100%;
	}

	.logout-button img {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100px;
		height: auto;
		transition: transform 0.3s;
		margin-right: 2vw;
	}

	.logout-button:hover {
		transform: scale(1.1);
		cursor: pointer;
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

	.icon {
		width: 40px;
		height: 100%;
		margin-left: 1vh;
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
