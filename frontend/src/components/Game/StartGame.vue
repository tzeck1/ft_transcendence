<template>
	<div class="start_game">
		<div class="slideshow">
			<div class="comp-block block-style" @click="toggleFunBlock">
				<img src="../../assets/pong.gif" class="block-image">
				<span class="block-title">Competitive</span>
			</div>
			<div :class="['fun-block', 'block-style', funBlockClass]">
				<img src="../../assets/pong.gif" class="block-image">
				<span class="block-title">Fun Mode</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const funBlockVisible = ref(true)

function toggleFunBlock() {
	funBlockVisible.value = !funBlockVisible.value
}

const funBlockClass = computed(() => {
	return funBlockVisible.value ? 'fun-block-visible' : 'fun-block-hidden'
})
</script>

<style scoped>
	/* .start_game {
		@apply ;
	} */

	.slideshow {
		@apply border mx-20 overflow-hidden flex items-center justify-center;

	}

	.block-style {
		@apply w-full md:w-1/3 lg:w-1/3 mx-2 px-2 py-60 bg-transparent transition-all duration-300 ease-in-out rounded-lg;
	}

	.block-style:hover {
		@apply transform bg-white bg-opacity-10 scale-110;
	}

	.block-image {
		@apply w-full h-auto;
	}

	.block-title {
		@apply block text-center mt-4;
	}

	.fun-block-visible {
		@apply opacity-100 translate-x-0;
	}

	.fun-block-hidden {
		@apply opacity-100 transform translate-x-full;
	}

	.block-style {
		@apply transition-all duration-1000 ease-in-out;
	}
</style>
