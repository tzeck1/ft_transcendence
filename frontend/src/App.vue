<script setup lang="ts">
	import { ref } from 'vue';
	import { useRouter } from 'vue-router';
	import { useUserStore } from './stores/UserStore';

	const router = useRouter();

	function loadIntro() {
		router.push('/');
	}

	const store = useUserStore();
</script>

<template>
	<header>
		<span class="logo">PONG</span>
		<!-- <img src="./assets/logo.png" alt="Logo" class="logo" /> -->
		<nav>
				<div class="nav-buttons">
						<router-link to="/profile" v-slot="{ navigate, isActive }">
							<button id="profileButton" @click="navigate" :class="{'active-button': isActive}">Profile</button>
						</router-link>
						<button class="game-button">Game</button>
						<button>Leaderboard</button>
				</div>
				<div class="logout-button" @click="loadIntro">
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
		font-size: 1vw;
	}
	
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		flex-shrink: 0;
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
	
	button {
		background-color: transparent;
		color: rgb(255, 255, 255);
		border: 1px solid rgba(255, 255, 255, 0);
		border-radius: 25px;
		padding: 2vw 5vw;
		cursor: pointer;
		outline: none;
		font-size: 2vw;
		font-family: 'ibm-3270', monospace;
	}
	
	button:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
	
	.active-button {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.game-button {
		font-size: 3.5vw;
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
	
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
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
	
	body, body * {
		animation: glowing 3s infinite;
	}

	.icon {
		width: 40px;
		height: 100%;
		margin-left: 1vw;
	}

	@media (max-width: 768px) {
		html, body {
			font-size: 2vw;
		}

		button {
			padding: 3vw 6vw;
			font-size: 3vw;
		}
		
		.game-button {
			font-size: 5vw;
		}
		
		.intro h1 {
			font-size: 6vw;
		}
		
		.intro p {
			font-size: 3vw;
		}

		.intro-ascii {
			font-size: 3vw;
		}
	}
</style>
