<template>
	<div class="friends-container">
		<h2 class="title">Friends List</h2>
		<div class="friends-list">
			
		</div>
	</div>
</template>


<script setup lang="ts">
	import { onMounted, ref, computed } from 'vue';
	import axios from 'axios';
	import { useUserStore } from '@/stores/UserStore';
	import { useRoute } from 'vue-router';
	import router from '@/router';

	const userStore = useUserStore();

	const getUsernameFromCookie = () => {
		const cookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('username='));
		if (cookie) {
			const usernameJson = cookie.split('=')[1];
			const user_name = JSON.parse(decodeURIComponent(usernameJson));
			return user_name;
		}
		return null;
	};

	onMounted(async () => {
		const cookie_username = getUsernameFromCookie();
		if (!cookie_username)
		{
			router.push('/'); //do we need to return after that?
			return ;
		}
		if (!userStore.intra)
			userStore.setIntra(cookie_username);
	});
</script>

<style scoped>

.friends-container {
	@apply flex h-full flex-col items-center justify-center;
	scrollbar-width: thin;
	scrollbar-color: transparent transparent;
}

.title {
	@apply flex items-center justify-center text-3xl font-bold text-center mb-8 ;
}

.friends-list {
	@apply flex flex-col items-center  w-full h-full border;
}

</style>
