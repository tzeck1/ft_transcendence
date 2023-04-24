<template>
	<StartGame v-if="showStart"></StartGame>
</template>

<script setup lang="ts">
	import StartGame from '../components/Game/StartGame.vue'
	import { ref } from 'vue';

	const showStart = ref(true);
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