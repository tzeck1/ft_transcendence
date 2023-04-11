<script setup lang="ts">
	import { ref } from 'vue';
	import { useRouter } from 'vue-router';

	const router = useRouter();

	function loadIntro() {
		router.push('/');
	}

</script>

<template>
	<header>
		<img src="./assets/logo.png" alt="Logo" class="logo" />
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

	html, body {
		font-family: 'ibm-3270', monospace;
		background-image: url("./assets/bg.gif");
		background-size: cover;
		background-repeat: no-repeat;
		color: white;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	
	
	header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem;
	flex-shrink: 0;
	}
	
	.logo {
		width: 100px;
		height: 100px;
		margin-bottom: 1rem;
		margin-left: 5rem;
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
	border: 2px solid rgba(255, 255, 255, 0);
	border-radius: 25px;
	padding: 20px 50px;
	margin: 0 45px;
	cursor: pointer;
	outline: none;
	font-size: 2rem;
	font-family: 'ibm-3270', monospace;
	}
	
	button:hover {
	background-color: rgba(255, 255, 255, 0.1);
	}
	
	.active-button {
	background-color: rgba(255, 255, 255, 0.1);
}

	.game-button {
		border-radius: 35px;
		font-size: 3.5rem;
	}

	.logout-button {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100px; /* Adjust the size of the logout button accordingly */
	height: 100%;
	}

	.logout-button img {
	display: flex;
		justify-content: center;
		align-items: center;
	width: 100px; /* Adjust this value to match the logo width */
	height: auto;
	transition: transform 0.3s;
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
	
	.sidebar {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 2rem;
	width: 20%;
	min-height: 100%;
	overflow-y: auto;
	overflow-x: hidden;
	}
	
	.profile-picture {
	width: 200px;
	height: 200px;
	border-radius: 50%;
	margin-top: 2rem;
	margin-bottom: 2rem;
	}

	.rank {
	width: 60px;
	height: 60px;
	margin-top: 2rem;
	margin-bottom: 1rem;
	}
	
	.grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-gap: 1rem;
	width: 80%;
	padding: 2rem;
	overflow-y: auto;
	height: 100%;
	}
	
	.grid-item {
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(0, 0, 0, 0.5);
	border-radius: 25px;
	padding: 1rem;
	font-size: 2rem;
	}
	
	
	.profile {
		display: flex;
		flex-grow: 1;
		flex-shrink: 0;
		overflow: hidden;
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
	
	body,
	body * {
		animation: glowing 3s infinite;
	}

	.two-factor-button {
		margin-top: auto;
		margin-bottom: 1rem;
		margin-left: 2rem;
	}
	
	.name-container {
		display: flex;
		justify-content: center;
		width: 100%;
}

.username-wrapper {
		display: inline-flex;
		position: relative;
}

#username span {
		position: relative;
		z-index: 1;
}

#toggle-username {
	font-family: 'ibm-3270', monospace;
		position: absolute;
		left: 110%;
		top: 50%;
		transform: translateY(-50%);
		background-color: transparent;
		color: white;
		border: none;
		font-size: 2.5rem;
		cursor: pointer;
		outline: none;
		padding: 5px;
		margin-left: 5px; /* Adjust this value based on the desired distance from the username */
}

#toggle-username:hover {
		background-color: rgba(255, 255, 255, 0.1);
}

#edit-username {
		font-family: 'ibm-3270', monospace;
		font-size: 2rem;
		background-color: transparent;
		border: none;
		color: white;
		outline: none;
		padding: 0;
		margin: 0;
		width: 1ch;
		text-align: center;
		animation: glowing 3s infinite;
}

.profile-picture-drop-area {
    position: relative;
  }

  .profile-picture-drop-area.highlight .profile-picture {
    opacity: 0.5;
  }

  .drop-icon {
    display: none;
    font-size: 15rem;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
  }

  .profile-picture-drop-area.highlight .drop-icon {
    display: block;
  }
	
	.intro {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		margin-top: 5rem;;
	}
	
	.intro h1 {
		font-size: 4rem;
		margin-bottom: 1rem;
	}
	
	.intro p {
		font-size: 1.5rem;
		margin-top: 2rem;
	}
	
	.intro a {
		color: white;
		text-decoration: none;
	}
</style>
