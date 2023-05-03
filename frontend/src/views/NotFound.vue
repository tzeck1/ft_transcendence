<template>
	<div class="wrapper">
		<span class="errormessage">Page not found.</span>
		<button @click=redirect_profile class="backbutton">Go back</button>
	</div>
</template>

<script setup lang="ts">

import router from '@/router';

function redirect_profile() {
	router.push('/profile');
}

</script>

<style scoped>

.wrapper {
	@apply flex flex-col items-center justify-center;
}

.errormessage {
	@apply animate-bounce text-2xl mt-32;
}

.backbutton {
	@apply border border-opacity-25 px-5 py-3 mt-8;
}

</style>