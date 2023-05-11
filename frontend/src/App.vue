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
		<div class="chat-box" v-if="!isIntro">
			<div class="chat-input-container">
				<div class="chat-history" v-show="inputFocus">
					<div class="flex-grow"></div>
					<p v-for="(msg, index) in [...lastMessages].reverse()" :key="index">{{ userStore.username + ': ' + msg }}</p>
				</div>
				<div class="chat-input-button-container">
					<input type="text" v-model="message" class="chat-input" @focus="inputFocus=true" @blur="inputFocus=false" @keyup.enter="sendMessage()" placeholder="Type your message...">
					<button class="chat-send" @click="sendMessage()">Send</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, watch, nextTick } from 'vue';
	import { useRouter, useRoute } from 'vue-router';
	import { useUserStore } from './stores/UserStore';

	const router = useRouter();
	const route = useRoute();
	const dropdownVisible = ref(false);
	const userStore = useUserStore();
	const message = ref('');
	const lastMessages = ref<string[]>([]);
	const inputFocus = ref(false);
	const isIntro = computed(() => route.path === '/');

	function loadIntro() {
		const cookies = document.cookie.split(";");
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i];
			const eqPos = cookie.indexOf("=");
			const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
			document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
		}
		userStore.delContent();
		router.push('/');
	}

	function toggleDropdown() {
		dropdownVisible.value = !dropdownVisible.value;
	}

	function hideDropdown() {
		dropdownVisible.value = false;
	}

	function sendMessage() {
		console.log(message.value);
		lastMessages.value.unshift(message.value);
		message.value = '';
	}

	// async function sendMessage() {
	// 	if (message.value.trim() === '') {
	// 		return;
	// 	}
	// 	const newMessage = message.value.trim();
	// 	message.value = '';
	// 	const messageChars = newMessage.split('');
	// 	let index = 0;
	// 	const typingInterval = setInterval(() => {
	// 		if (index < messageChars.length) {
	// 			lastMessages.value[0] += messageChars[index];
	// 			index++;
	// 		} else {
	// 			clearInterval(typingInterval);
	// 		}
	// 	}, 50);
	// }

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

	.chat-box {
		@apply fixed bottom-0 left-0 m-4 flex items-center space-x-2;
	}

	.chat-input-container {
		@apply flex flex-col w-60;
	}

	.chat-input-button-container {
		@apply flex items-center space-x-2;
	}

	.chat-input {
		@apply p-2 bg-transparent rounded border border-white;
	}

	.chat-input:focus {
		@apply outline-none;
	}

	.chat-send {
		@apply p-2 rounded cursor-pointer;
	}

	.chat-history {
		@apply overflow-auto break-words h-60 flex flex-col bg-transparent bg-opacity-10 rounded p-2 mb-2;
		scrollbar-width: thin;
		scrollbar-color: transparent transparent;
	}

	.chat-history::-webkit-scrollbar { /* Chrome, Safari and Edge */
		width: 8px;
	}

	.chat-history::-webkit-scrollbar-thumb { /* Chrome, Safari and Edge */
		background: transparent;
	}

	.chat-history::-webkit-scrollbar-thumb:hover { /* Chrome, Safari and Edge */
		background: #fff;
	}

	.flex-grow {
		flex-grow: 1;
	}

</style>