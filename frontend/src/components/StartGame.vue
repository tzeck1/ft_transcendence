<template>
	<div class="start_game">
		<router-link to="/game" v-slot="{ navigate, isActive }">
			<button id="game-button" @click="navigate" :class="{'active-button': isActive}" >Start Game</button>
		</router-link>
	</div>
</template>

<style scoped>

</style>