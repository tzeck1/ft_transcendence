<template>
	<div class="leaderboard-container">
		<div v-for="(user, index) in users" :key="user.id" @click="showProfile(user.intra_name)" :class="{'highlight': user.username === username}" class="user-item">
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
	import router from '@/router';

	interface User {
		id: number;
		intra_name: string;
		username: string;
		profile_picture: string;
		rank: number;
		games_played: number;
	}

	const users = ref<User[]>([]);
	const userStore = useUserStore();
	const { username } = storeToRefs(userStore);

	function showProfile(intra: string) {
		router.push(`/profile/${intra}`);
	}

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
		const userData = await axios.get(`http://${location.hostname}:3000/users/getUsers`);
		users.value = userData.data;
	});
</script>

<style scoped>

	.leaderboard-container {
		@apply h-full text-xl overflow-auto;
		scrollbar-width: thin;
		scrollbar-color: transparent transparent;
	}

	.leaderboard-container::-webkit-scrollbar { /* Chrome, Safari and Edge */
		width: 8px;
	}

	.leaderboard-container::-webkit-scrollbar-thumb { /* Chrome, Safari and Edge */
		background: transparent;
	}

	.leaderboard-container::-webkit-scrollbar-thumb:hover { /* Chrome, Safari and Edge */
		background: #fff;
	}

	.user-details {
		@apply flex flex-row items-center my-16 py-4;
	}

	.user-details:hover {
		@apply cursor-pointer transform scale-x-105 transition-all duration-300 ease-in-out;
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