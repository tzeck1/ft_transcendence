<template>
	<div class="startgame">
		<div class="slideshow" :class="{ blur: showCount }" v-if="!invited">
			<div :class="['block-style', compSetClass]">
				<button class="set-button" @click="search_game(false, false)" v-if="compBlockSelected">
						<span v-show="!isLooking">Queue</span>
						<span v-show="isLooking">Cancel</span>
				</button>
			</div>
			<div :class="['comp-block', 'block-style', compBlockClass]" @click="selectCompBlock">
				<img src="../../assets/pong.gif" class="block-image">
				<span class="block-title">Competitive</span>
				<span class="block-help" v-show="compBlockSelected">Face off against random players globally in this thrilling mode. Each victory earns you rank points to climb the leaderboard. Skill and strategy are key</span>
			</div>
			<div :class="['fun-block', 'block-style', funBlockClass]" @click="selectFunBlock">
				<img src="../../assets/pong.gif" class="block-image">
				<span class="block-title">Fun Mode</span>
				<span class="block-help" v-show="funBlockSelected">Queue against a random opponent for a carefree challenge. Play one of our two modes: Speed Pong or Dodge Ball. Choice is yours</span>
			</div>
			<div :class="['block-style', funSetClass]">
				<button class="set-button" @click="search_game(true, false)" v-if="funBlockSelected">
						<span v-show="!isLooking">Queue</span>
						<span v-show="isLooking">Cancel</span>
				</button>
				<div class="gamemode">
					<button class="mode" @click="speed_mode" :class="{'highlight': mode == 'speed'}">Speed Pong</button>
					<button class="mode" @click="dodge_mode" :class="{'highlight': mode == 'dodge'}">Dodge Ball</button>
				</div>
				<!-- <select name="mode" id="mode" multiple>
  					<option value="speed">Speed pong</option>
  					<option value="dodge">Dodge ball</option>
				</select> -->
			</div>
		</div>
		<div class="countdown-overlay" v-if="showCount">
			<div class="grid">
				<div class="player">
					<img id="player-picture" class="profile-picture" :src="profile_picture"/>
					<h1 class="username-text">{{ username }}</h1>
				</div>
				<div id="countdown" class="countdown">
					<span id="seconds">{{ timeLeft }}</span>
				</div>
				<div class="enemy">
					<img id="enemy-picture" class="profile-picture" :src="enemy_picture"/>
					<h1 class="username-text">{{ enemy_name }}</h1>
				</div>
			</div>
		</div>
		<div class="private_game_container" v-if="invited">
			<div class="grid rdy-page">
				<div class="player">
					<img id="player-picture" class="profile-picture rdy-pic" :src="profile_picture"/>
					<h1 class="username-text">{{ username }}</h1>
				</div>
				<div class="vs-text">
					<span>vs.</span>
				</div>
				<div class="enemy">
					<img id="enemy-picture" class="profile-picture rdy-pic" :src="enemy_picture"/>
					<h1 class="username-text">{{ enemy_name }}</h1>
				</div>
			</div>
			<button class="rdy-button" @click="search_game(true, true)" v-if="invited">
				<span v-show="!isLooking">Ready</span>
				<span v-show="isLooking">Cancel</span>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted, onBeforeUnmount, defineComponent, vModelCheckbox, watch } from 'vue'
	import { useUserStore } from '../../stores/UserStore';
	import { io, Socket } from 'socket.io-client';
	import { storeToRefs } from 'pinia';
	import { useGameStore } from '../../stores/GameStore';
	import router from '@/router';
	import axios from 'axios';

	const userStore = useUserStore();
	const gameStore = useGameStore();
	const funBlockVisible = ref(true);
	const compBlockVisible = ref(true);
	const compBlockSelected = ref(false);
	const funBlockSelected = ref(false);
	const isLooking = ref(false);
	const showCount = ref(false);
	const timeLeft = ref(4);
	const invited = ref(false);
	var socket;
	const { username } = storeToRefs(userStore);
	const { profile_picture } = storeToRefs(userStore);
	const { enemy_name } = storeToRefs(gameStore);
	const { enemy_picture } = storeToRefs(gameStore);
	const	mode = ref('none');
	const emit = defineEmits(["start-match", "show-end", "show-start"]);

	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			console.log("page is hidden!");
			if (gameStore.socket != null) {

				if (isLooking.value == true){ // in queue, so get out of there and update the isLooking flag
					socket.emit("cancelQueue", userStore.intra);
					isLooking.value = false;
					userStore.socket?.emit("setIngameStatus", false);
					gameStore.disconnectSocket();
				} else {//user is ingame, not only in queue
					gameStore.disconnectSocket();
					userStore.socket?.emit("setIngameStatus", false);
					router.push('/profile');
				}
			}
		} else {//document.hidden != true
			console.log("page is visible");
		}
	});

	async function setInvited()
	{
		if (router.currentRoute.value.query.invited == "true")
		{
			invited.value = true;
			gameStore.setEnemyName(router.currentRoute.value.query.opponent);
			let pic = await axios.get(`http://${location.hostname}:3000/users/getPicByUsername?username=${router.currentRoute.value.query.opponent}`);
			gameStore.setEnemyPicture(pic.data);
			gameStore.setMode(router.currentRoute.value.query.mode);
		}
	}

	onMounted(async () => {
		await setInvited();
	});

	watch( () => router.currentRoute.value.query.invited, async (newVal, oldVal) => {
		await setInvited();
	});

	onBeforeUnmount(() => {
		console.log("onBeforeUnmount of StartGame.vue called");
		if (isLooking.value == true) {
			console.log("onbeforeunmount is also doing stuff");
			socket.emit("cancelQueue", userStore.intra);
			userStore.socket?.emit("setIngameStatus", false);
			gameStore.disconnectSocket();
			isLooking.value = false;
		}
	});

	function countdown() {
		console.log("countdown was called");
		timeLeft.value--;
		if (timeLeft.value > 0)
			setTimeout(countdown, 1000);
		else
		{
			showCount.value = false;
			timeLeft.value = 4;
			console.log("emitting start-match from countdown!");
			emit('start-match');
		}
	}

	function search_game(fun: boolean, invited: boolean)
	{
		if (invited == false)
			gameStore.setMode("");
		if (fun == true && invited == false)
		{
			if (mode.value == 'none') //no mode selcted
				return ;
			gameStore.setMode(mode.value);
		}
		console.log("Game mode is: ", gameStore.mode);
		//establish connection
		if (!isLooking.value) {
			socket = io(`${location.hostname}:3000/game_socket`);
			if (socket != undefined)
				userStore.socket?.emit("setIngameStatus", true);
			gameStore.setSocket(socket);
			socket.on('connect', function() {
				console.log('game socket Connected');
			});
			socket.on('disconnect', function() {
				console.log('game socket Disconnected');
				userStore.socket!.emit("setIngameStatus", false);
			});
			socket.on('foundOpponent', function(username: string, pic: string, room_id: string) {
				console.log("foundOpponent which also calls countdown was called");
				isLooking.value = false;
				gameStore.setIntra(userStore.intra);
				gameStore.setRoomId(room_id);
				gameStore.setEnemyName(username);
				gameStore.setEnemyPicture(pic);
				showCount.value = true;
				countdown();
			});
			socket.on('noOpponent', function() {
				console.log("No fitting opponent in matchmaking, waiting...");
			});
			if (gameStore.socket?.hasListeners("sendToProfile") == false) {
				gameStore.socket!.on("sendToProfile", () => {
					router.push('/profile');
				});
			}
			if (invited == true)
				socket.emit("createOrJoinMode", userStore.intra, gameStore.mode, router.currentRoute.value.query.opponent, true);
			else if (gameStore.mode == "")
				socket.emit("createOrJoin", userStore.intra);
			else
				socket.emit("createOrJoinMode", userStore.intra, gameStore.mode, "", false);

			isLooking.value = true;
		}
		else {
			console.log("store.intra is: ", userStore.intra, "canceling queue next");
			socket.emit("cancelQueue", userStore.intra);
			userStore.socket?.emit("setIngameStatus", false);
			isLooking.value = false;
			gameStore.disconnectSocket();
		}
	}

	function speed_mode() {
		if (mode.value == 'none' || mode.value == 'dodge')
			mode.value = 'speed';
		else if (mode.value == 'speed')
			mode.value = 'none';
	}

	function dodge_mode() {
		if (mode.value == 'none' || mode.value == 'speed')
			mode.value = 'dodge';
		else if (mode.value == 'dodge')
			mode.value = 'none';
	}

	function selectCompBlock() {
		if (funBlockSelected.value)
			return ;
		funBlockVisible.value = !funBlockVisible.value
		compBlockSelected.value = !compBlockSelected.value;
	}

	function selectFunBlock() {
		if (compBlockSelected.value)
			return ;
		compBlockVisible.value = !compBlockVisible.value;
		funBlockSelected.value = !funBlockSelected.value;
	}

	const compBlockClass = computed(() => {
		if (funBlockSelected.value)
			return ('comp-block-hidden');
		else if (funBlockVisible.value)
			return ('comp-block-visible');
		return ('comp-block-selected');
	})

	const funBlockClass = computed(() => {
		if (compBlockSelected.value)
			return ('fun-block-hidden');
		else if (compBlockVisible.value)
			return ('fun-block-visible');
		return ('fun-block-selected');
	})

	const funSetClass = computed(() => {
		if (funBlockSelected.value)
			return ('fun-set-visible');
		return ('fun-set-hidden');
	})

	const compSetClass = computed(() => {
		if (compBlockSelected.value)
			return ('comp-set-visible');
		return ('comp-set-hidden');
	})
</script>

<style scoped>

	/* @font-face {
		font-family: ibm-3270;
		src: url('./assets/3270-Regular.ttf') format('truetype');
	} */

	.startgame {
		@apply h-full;
	}

	.slideshow {
		@apply flex h-full items-center justify-center;
	}

	.block-style {
		/* @apply border w-full md:w-1/3 lg:w-1/3 mx-2 px-2 py-60 bg-transparent transition-all duration-300 ease-in-out rounded-lg; */
		@apply flex flex-col justify-center items-center w-1/4 h-1/2 transition-all duration-700 ease-in-out rounded-lg;
	}

	.comp-block:hover, .fun-block:hover {
		/* @apply transform bg-white bg-opacity-10 scale-110; */
		@apply bg-white bg-opacity-10;
	}

	.set-button {
		@apply flex lg:text-2xl md:text-xl sm:text-lg text-base bg-white bg-opacity-10 px-6 py-4 mb-2;
	}

	.set-button:hover {
		@apply text-3xl transition-all duration-300 ease-in-out;
	}

	.block-image {
		@apply w-full h-auto;
	}

	.block-title {
		@apply mb-4 block text-center mt-4 font-extrabold lg:text-xl md:text-lg sm:text-sm text-xs transition-all duration-300 ease-in-out;
	}

	.fun-block-visible, .comp-block-visible {
		@apply opacity-100 translate-x-0;
	}

	.fun-block-selected {
		@apply opacity-100 transform -translate-x-full;
		@apply bg-white bg-opacity-10;
	}

	.fun-block-hidden {
		@apply opacity-0 transform translate-x-full;
	}

	.fun-set-visible {
		@apply opacity-100 transform -translate-x-full;
	}

	.fun-set-hidden {
		@apply opacity-0 transform -translate-x-0;
	}
	.comp-block-selected {
		@apply opacity-100 transform translate-x-full;
		@apply bg-white bg-opacity-10;
	}
	.comp-block-hidden {
		@apply opacity-0 transform -translate-x-full;
	}

	.comp-set-visible {
		@apply opacity-100 transform translate-x-full;
	}

	.comp-set-hidden {
		@apply opacity-0 transform translate-x-0;
	}

	.blur {
		filter: blur(7px);
	}

	.countdown-overlay {
		@apply fixed w-full h-full flex items-center justify-between z-50 top-0 bg-black bg-opacity-60;
	}

	.grid {
		@apply inline-flex w-full items-center justify-center gap-40;
	}


	.player, .enemy {
		@apply flex flex-col items-center;
	}

	.profile-picture {
		@apply lg:w-40 lg:h-40 md:w-32 md:h-32 sm:w-20 sm:h-20 w-16 h-16 rounded-full object-cover;
	}

	.username-text {
		@apply mt-3 text-4xl;
	}

	.countdown {
		@apply text-9xl animate-ping;
	}

	.private_game_container {
		@apply flex flex-col items-center justify-center;
	}

	.rdy-page {
		@apply mt-32;
	}

	.vs-text {
		@apply text-4xl font-extrabold -mx-10;
	}

	.rdy-button{
		@apply mt-32 py-10 px-20 text-5xl;
	}

	.gamemode {
		@apply flex xl:flex-row flex-col mt-6;
	}

	.mode {
		@apply py-4 px-4 lg:text-2xl md:text-xl sm:text-lg text-xs whitespace-nowrap;
	}

	.highlight {
		@apply bg-white bg-opacity-10;
	}

	.block-help {
		@apply lg:block hidden text-lg px-6 text-center transition-all duration-300 ease-in-out;
	}
</style>
