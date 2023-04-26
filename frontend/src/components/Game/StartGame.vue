<template>
		<div class="slideshow">
			<div :class="['block-style', compSetClass]">
				<button class="block-image"> Start Game </button>
				<span class="block-title">Settings</span>
			</div>
			<div :class="['comp-block', 'block-style', compBlockClass]" @click="selectCompBlock">
				<img src="../../assets/pong.gif" class="block-image">
				<span class="block-title">Competitive</span>
			</div>
			<div :class="['fun-block', 'block-style', funBlockClass]" @click="selectFunBlock">
				<img src="../../assets/pong.gif" class="block-image">
				<span class="block-title">Fun Mode</span>
			</div>
			<div :class="['fun-block-settings', 'block-style', funSetClass]">
				<span class="block-title">Settings</span>
			</div>
		</div>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue'

const funBlockVisible = ref(true);
const compBlockVisible = ref(true);
const compBlockSelected = ref(false);
const funBlockSelected = ref(false);

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

	.slideshow {
		@apply w-screen flex items-center justify-center;
		height: 100%;
		/* top: 50%; */
  		-ms-transform: translateY(25%);
  		transform: translateY(25%);
	}

	.block-style {
		@apply w-full md:w-1/3 lg:w-1/3 mx-2 px-2 py-60 bg-transparent transition-all duration-300 ease-in-out rounded-lg;
	}

	.block-style:hover {
		/* @apply transform bg-white bg-opacity-10 scale-110; */
		@apply bg-white bg-opacity-10;
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

	.comp-block-visible {
		@apply opacity-100 translate-x-0;
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

	.block-style {
		@apply transition-all duration-1000 ease-in-out;
	}
</style>
