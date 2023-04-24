<template>
	<div class="end_game">
		<router-link to="/start" v-slot="{ navigate, isActive }">
			<button id="game-button" @click="navigate" :class="{'active-button': isActive}" >Play Again</button>
		</router-link>
	</div>
</template>

<style scoped>

</style>