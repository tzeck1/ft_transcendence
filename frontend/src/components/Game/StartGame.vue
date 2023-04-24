<template>
	<div class="start_game">
		<div class="container">
			<transition name="slide">
				<div v-if="showComp" class="comp-container" @click="selectCompetitive">
					<img src="../../assets/pong.gif">
					<span>Competetive</span>
				</div>
			</transition>
			<transition name="slide">
				<div v-if="showFun" class="fun-container">
					<img src="../../assets/pong.gif">
					<span>Fun Mode</span>
				</div>
			</transition>
			<transition name="slide">
				<button v-if="showStart" class="start-game-button">Start Game</button>
			</transition>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showComp = ref(true);
const showFun = ref(true);
const showStart = ref(false);

const selectCompetitive = () => {
	showFun.value = !showFun.value;
	showStart.value = !showStart.value;
};
</script>

<style scoped>
	.start_game {
		position: absolute;
		top: 50%;
		left: 50%;
		-ms-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
	}
	
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 2vw;
		margin-left: 2vw;
		overflow: hidden;
		position: relative;
	}
	
	.comp-container, .fun-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 2.5vh;
		padding: 15vh 2vh;
		border-radius: 25px;
		margin: 0 1vw;
		/* position: absolute; */
	}
	
	.comp-container img, .fun-container img {
		position: relative;
		transition: transform 0.3s ease-in-out;
		transform-origin: center center;
	}

	.comp-container:hover, .fun-container:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.comp-container:hover img, .fun-container:hover img {
		transform: scale(1.2);
	}

	.start-game-button {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		padding: 1.5vh 2vh;
		border-radius: 25px;
		opacity: 0;
	}

	.slide-enter-active, .slide-leave-active {
		transition: transform 1s, opacity 1s;
	}

	.slide-enter {
		transform: translateX(100%);
		opacity: 0;
	}

	.slide-enter-to {
		transform: translateX(0);
		opacity: 1;
	}

	.slide-leave {
		transform: translateX(0);
		opacity: 1;
	}

	.slide-leave-to {
		transform: translateX(100%);
		opacity: 0;
	}
</style>