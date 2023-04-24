<template>
	<div id="game" class="game">
		<!-- Game gets loaded in here -->
	</div>
	<div class="giveUp-button" @click="giveUp" >
		<img src="../assets/give_up.jpeg" alt="Give Up">
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import Phaser from 'phaser';
	import Pong from '../game/pong';
	import router from '@/router';

	const game = ref<Phaser.Game | null>(null);

	onMounted(() => {
		const config: Phaser.Types.Core.GameConfig = {
			type: Phaser.AUTO,
			width: 1920,
			height: 1080,
			parent: "game",
			transparent: true,
			physics: {
				default: 'arcade',
				arcade: {
					gravity: { y: 0 },
				},
			},
			scale: {
				parent: "game",
				mode: Phaser.Scale.FIT,
				autoCenter: Phaser.Scale.CENTER_BOTH,
				width: 1920,
				height: 1080
			},
			scene: [Pong]
		};

		game.value = new Phaser.Game(config);
	});

	function giveUp() {
		game.value?.scene.stop('pong');
		router.push('/end');
	}
</script>


<style scoped>

	.giveUp-button {
		/* display: flex; */
		justify-content: center;
		align-items: center;
		max-width: 100px;  
		height: auto;  
	}

</style>