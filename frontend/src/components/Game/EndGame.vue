<template>
	<div class="end_game">
		<button class="game-button" @click="playAgain" >Play Again</button>
		<button class="quit-button" @click="quit" >Back To Start</button>
	</div>
</template>

<script setup lang="ts">

	import { useGameStore } from '@/stores/GameStore';
	import { useUserStore } from '@/stores/UserStore';

	const emit = defineEmits(["start-match", "show-start"]);
	const gameStore = useGameStore();
	const userStore = useUserStore();


	function playAgain() {
		emit("start-match");
	}

	function quit() {
		gameStore.disconnectSocket();
		userStore.socket?.emit("setIngameStatus", false);
		emit("show-start");
	}

</script>

<style scoped>

</style>