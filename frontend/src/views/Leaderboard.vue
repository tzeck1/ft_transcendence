<template>
	<div class="leaderboard-container">
		<div v-for="(user, index) in users" :key="user.id" :class="{'highlight': user.username === username}" class="user-item">
			<div class="user-details">
				<p class="position">#{{ index + 1 }}</p>
				<div class="picture-container">
					<img class="profile_picture" :src="user.profile_picture"/>
				</div>
				<p class="username">{{ user.username }}</p>
				<p class="rank">Rank: {{ user.rank }}</p>
				<p class="played">Games Played: {{ user.games_played }}</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { onMounted, ref, computed } from 'vue';
	import axios from 'axios';
	import { useUserStore } from '@/stores/UserStore';
	import { storeToRefs } from 'pinia';

	interface User {
		id: number;
		username: string;
		profile_picture: string;
		rank: number;
		games_played: number;
	}

	const users = ref<User[]>([]);
	const userStore = useUserStore();
	const { username } = storeToRefs(userStore);

	onMounted(async () => {
		const userData = await axios.get(`http://${location.hostname}:3000/users/getUsers`);
		users.value = userData.data;
	});
</script>

<style scoped>

	.leaderboard-container {
		@apply h-full text-xl overflow-auto;
	}

	.user-details {
		@apply flex flex-row items-center my-16 py-4;
	}

	.picture-container {
		@apply flex justify-center w-1/5;
	}

	.profile_picture {
		@apply w-20 h-20 rounded-full object-cover;
	}

	.position {
		@apply text-center w-1/5 text-3xl;
	}

	.username {
		@apply text-center w-1/5;
	}

	.rank {
		@apply text-center w-1/5;
	}

	.played {
		@apply text-center w-1/5;
	}

	.highlight {
		@apply bg-white bg-opacity-10 rounded-2xl;
	}
</style>