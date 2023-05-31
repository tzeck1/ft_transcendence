<template>
	<div class="startgame">
		<div class="slideshow" :class="{ blur: showCount }">
			<div :class="['block-style', compSetClass]">
				<button class="set-button" @click="search_game(false)" v-if="compBlockSelected">
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
				<span class="block-help" v-show="funBlockSelected">Queue against a random opponent for a carefree challenge. Play classic pong or spice things up with Speed Pong or Dodge Ball. Choice is yours</span>
			</div>
			<div :class="['block-style', funSetClass]">
				<button class="set-button" @click="search_game(true)" v-if="funBlockSelected">
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
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted, defineComponent, vModelCheckbox, watch } from 'vue'
	import { useUserStore } from '../../stores/UserStore';
	import { io, Socket } from 'socket.io-client';
	import { storeToRefs } from 'pinia';
	import { useGameStore } from '../../stores/GameStore';
	import Game from '../../views/Game.vue'
	import endGame from '../Game/EndGame.vue'
	import router from '@/router';

	const userStore = useUserStore();
	const gameStore = useGameStore();
	const funBlockVisible = ref(true);
	const compBlockVisible = ref(true);
	const compBlockSelected = ref(false);
	const funBlockSelected = ref(false);
	const isLooking = ref(false);
	const showCount = ref(false);
	const timeLeft = ref(4);
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
			userStore.socket?.emit("")
			if (gameStore.socket != null) {
				console.log("user was ingame and changed tab!");

				if (isLooking.value == true){
					search_game(false);
					console.log("isLooking is", isLooking.value);
				} else {//user is ingame, not only in queue
					//if inside an actual game room, let the other user know their enemy left the game and it counts as a win
					userStore.socket!.emit("setIngameStatus", false);
					gameStore.disconnectSocket();
					router.push('/profile');
					//quit the game, save the game data to database
				}
			}
		} else {//document.hidden != true
			console.log("page is visible");
		}
	});

	// redundancy (watch and onMounted) because watch is needed when page is reloaded on game page (new socket created),
	// and onMounted is needed when just switching to game page
	watch( () => userStore.socket, (newVal, oldVal) => {
		// console.log("triggered watch, userStore.socket changed to", newVal, "from", oldVal);
		if (newVal != undefined) {
			if (userStore.socket?.hasListeners("gameInvite") == false) {
				// console.log("setup listener for gameInvite");
				userStore.socket!.on("gameInvite", (intra: string, other_intra: string, mode: string) => {
					// console.log("executing gameInvite");
					gameStore.setMode(mode);
					gameStore.setSocket(io(`${location.hostname}:3000/game_socket`, {autoConnect: false}));
					if (gameStore.socket!.hasListeners("privatePlayReady") == false) {
						// console.log("setup listener for privatePlayReady");
						gameStore.socket!.on("privatePlayReady", (username: string, pic: string, room_id: string) => {
							// console.log("executing privatePlayReady");
							gameStore.setIntra(userStore.intra);
							gameStore.setEnemyName(username);
							gameStore.setEnemyPicture(pic);
							gameStore.setRoomId(room_id);
							showCount.value = true;
							countdown();
						});
					}
					// console.log("emitting inviteplay");
					gameStore.socket!.emit("invitePlay", {intra: intra, other_intra: other_intra});
				});
			}
		}
		else
			console.log("newVal was undefined in the watch function");//does this ever happen?
	});

	// redundancy (watch and onMounted) because watch is needed when page is reloaded on game page (new socket created),
	// and onMounted is needed when just switching to game page
	onMounted(() => {
		console.log("onmounted of startGame.vue");
		if (userStore.socket?.hasListeners("gameInvite") == false) {
			// console.log("setup listener for gameInvite");
			userStore.socket!.on("gameInvite", (intra: string, other_intra: string, mode: string) => {
				// console.log("executing gameInvite");
				gameStore.setMode(mode);
				gameStore.setSocket(io(`${location.hostname}:3000/game_socket`, {autoConnect: false}));
				if (gameStore.socket!.hasListeners("privatePlayReady") == false) {
					// console.log("setup listener for privatePlayReady");
					gameStore.socket!.on("privatePlayReady", (username: string, pic: string, room_id: string) => {
						// console.log("executing privatePlayReady");
						gameStore.setIntra(userStore.intra);
						gameStore.setEnemyName(username);
						gameStore.setEnemyPicture(pic);
						gameStore.setRoomId(room_id);
						showCount.value = true;
						countdown();
					});
				}
				// console.log("emitting inviteplay");
				gameStore.socket!.emit("invitePlay", {intra: intra, other_intra: other_intra});
			});

		}
	});

	function countdown() {
		timeLeft.value--;
		if (timeLeft.value > 0)
			setTimeout(countdown, 1000);
		else
		{
			showCount.value = false;
			timeLeft.value = 4;
			emit('start-match');
		}
	}

	function search_game(fun: boolean)
	{
		gameStore.setMode("");
		if (fun == true)
		{
			if (mode.value == 'none') //no mode selcted
				return ;
			gameStore.setMode(mode.value);
		}
		//establish connection
		if (!isLooking.value) {
			socket = io(`${location.hostname}:3000/game_socket`);
			if (socket != undefined)
				userStore.socket?.emit("setIngameStatus", true);
			gameStore.setSocket(socket);
			socket.on('connect', function() {
				console.log('Connected');
			});
			socket.on('disconnect', function() {
				console.log('Disconnected');
			});
			socket.on('foundOpponent', function(username: string, pic: string, room_id: string) {
				isLooking.value = false;
				gameStore.setIntra(userStore.intra);
				gameStore.setEnemyName(username);
				gameStore.setEnemyPicture(pic);
				gameStore.setRoomId(room_id);
				showCount.value = true;
				countdown();
			});
			socket.on('noOpponent', function() {
				console.log("No fitting opponent in matchmaking, waiting...");
			});
			if (gameStore.mode == "")
				socket.emit("createOrJoin", userStore.intra);
			else
				socket.emit("createOrJoinMode", userStore.intra, gameStore.mode);

			isLooking.value = true;
		}
		else {
			console.log("store.intra is: ", userStore.intra);
			socket.emit("cancelQueue", userStore.intra);
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
		@apply w-40 h-40 rounded-full object-cover;
	}

	.username-text {
		@apply mt-3 text-4xl;
	}

	.countdown {
		@apply text-9xl animate-ping;
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
