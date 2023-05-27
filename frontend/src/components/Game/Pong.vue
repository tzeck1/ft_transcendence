<template>
	<div class="game-overlay">
		<div class="grid">
			<div class="player">
				<img id="player-picture" class="profile-picture" :src="profile_picture"/>
				<h1 class="username-text">{{ username }}</h1>
			</div>
			<div class="enemy">
				<h1 class="username-text">{{ enemy_name }}</h1>
				<img id="enemy-picture" class="profile-picture" :src="enemy_picture"/>
			</div>
		</div>
		<div id="game" class="game">
				<!-- Game gets loaded in here -->
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted, onBeforeUnmount } from 'vue';
	import Phaser from 'phaser';
	import Pong from '../../game/pong';
	import router from '@/router';
	import { useUserStore } from '../../stores/UserStore';
	import { storeToRefs } from 'pinia';
	import { useGameStore } from '../../stores/GameStore';

	const game = ref<Phaser.Game | null>(null);
	const emit = defineEmits(["show-end"]);
	const userStore = useUserStore();
	const gameStore = useGameStore();
	const { username } = storeToRefs(userStore);
	const { profile_picture } = storeToRefs(userStore);
	const { enemy_name } = storeToRefs(gameStore);
	const { enemy_picture } = storeToRefs(gameStore);

	onMounted(() => {
		const config: Phaser.Types.Core.GameConfig = {
			type: Phaser.AUTO,
			width: 1920,
			height: 1080,
			parent: "game",
			transparent: true,
			title: "testadwa",
			physics: {
				default: 'arcade',
				arcade: {
					gravity: { y: 0 },
				},
			},
			scale: {
				parent: "game",
				mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
				autoCenter: Phaser.Scale.CENTER_BOTH,
				width: 1920,
				height: 1080
			},
			scene: [Pong]
		};

		console.log("New game instance!");
		game.value = new Phaser.Game(config);
		game.value.events.on('destroy', () => {
			game.value = null;
			console.log('Game instance destroyed!');
			emit('show-end');
		});
	});

	onBeforeUnmount(() => {
		console.log("Phaser.vue on before unmount was called, destroying game.value now");
		game.value?.destroy(true);
		userStore.socket?.emit("setIngameStatus", false);
	});
</script>

<style scoped>

	.game-overlay {
		@apply flex-col flex items-center;
	}
	.grid {
		@apply mt-20 mb-10 inline-flex w-full max-w-7xl justify-center;
	}

	.player, .enemy {
		@apply flex flex-row items-center w-full justify-center max-w-7xl;
	}

	.profile-picture {
		@apply w-20 h-20 rounded-full object-cover;
	}

	.username-text {
		@apply text-2xl mx-10;
	}

	.game {
		@apply max-w-7xl;
	}
</style>