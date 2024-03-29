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
	import { utils } from '../utils/utils';

	interface User {
		id: number;
		intra_name: string;
		username: string;
		profile_picture: string;
		rank: number;
		games_played: number;
	}

	const util = new utils();
	const users = ref<User[]>([]);
	const userStore = useUserStore();
	const { username } = storeToRefs(userStore);

	function showProfile(intra: string) {
		router.push(`/profile/${intra}`);
	}

	onMounted(async () => {
		const cookie_username = util.getUsernameFromCookie();
		if (!cookie_username)
		{
			router.push('/'); //do we need to return after that?
			return ;
		}
		if (!userStore.intra)
			userStore.setIntra(cookie_username);
		const response = await axios.get(`http://${location.hostname}:3000/auth/getUserData?intra=${userStore.intra}`);
		const data = response.data;
		userStore.setUsername(data.username);
		userStore.setProfilePicture(data.profile_picture);
		userStore.setTFA(data.tfa_enabled);
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
		@apply flex justify-center lg:w-1/5 w-1/4 transition-all duration-300 ease-in-out;
	}

	.profile_picture {
		@apply w-20 h-20 rounded-full object-cover;
	}

	.position {
		@apply text-center lg:w-1/5 w-1/4 text-3xl transition-all duration-300 ease-in-out;
	}

	.username {
		@apply text-center lg:w-1/5 w-1/4 transition-all duration-300 ease-in-out;
	}

	.rank {
		@apply text-center lg:w-1/5 w-1/4 transition-all duration-300 ease-in-out;
	}

	.played {
		@apply text-center lg:w-1/5 lg:block hidden transition-all duration-300 ease-in-out;
	}

	.highlight {
		@apply bg-white bg-opacity-10 rounded-2xl;
	}
</style>