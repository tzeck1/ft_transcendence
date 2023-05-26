<template>
	<div class="profile">
		<div class="content-wrapper">
			<div class="sidebar">
				<img id="profile-picture" class="profile-picture" :src="profile_picture"/>
				<div class="name-container">
					<div class="username-wrapper">
						<h1 class="username-text">{{ username }}</h1>
					</div>
				</div>
				<button class="friend-button" v-if="showAmigo" @click="amigofy">Amigo-fy Us</button>
				<span class="friend-confirmend" v-if="!showAmigo">You Are Amigos</span>
				<!-- <span class="mt-7 font-bold">Rank</span> -->
				<img class="rank" src="../assets/ranks/floppy_2.png" alt="Rank" v-if="rank < 15" />
				<img class="rank" src="../assets/ranks/memorycard.png" alt="Rank" v-if="rank < 35 && rank > 15" />
				<img class="ssd" src="../assets/ranks/ssd.png" alt="Rank" v-if="rank > 35" />
				<span>{{ rank }}</span>
			</div>
			<div class="feature-grid">
				<MatchHistory class="grid-item"></MatchHistory>
				<!-- <Stats class="grid-item">Stats</Stats> -->
				<!-- <div class="grid-item">Friends</div> -->
				<Achievements class="grid-item"></Achievements>
				<!-- <div class="grid-item">Statistics</div> -->
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted, watch, nextTick, computed } from 'vue';
	import MatchHistory from '../components/Profile/MatchHistory.vue';
	import Achievements from '@/components/Profile/Achievements.vue';
	import axios from 'axios';
	import { useUserStore } from '../stores/UserStore';
	import { storeToRefs } from 'pinia';
	import router from '@/router';
	import { useRoute } from 'vue-router';

	const rank = ref(0);
	const userStore = useUserStore();
	const username = ref('');
	const profile_picture = ref('');
	const intra	= ref('');
	const showAmigo = ref(true);
	const amigoPending = ref(false);

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
		try {
			const cookie_username = getUsernameFromCookie();
			if (!cookie_username)
			{
				router.push('/'); //do we need to return after that?
				return ;
			}
			const route = useRoute();
			intra.value = route.params.username.toString();

			if (!userStore.intra)
				userStore.setIntra(cookie_username);
			if (intra.value == userStore.intra)
				router.push('/profile');
			const response = await axios.get(`http://${location.hostname}:3000/auth/getUserData?intra=${intra.value}`);
			if (response.data) {
				const data = response.data;
				username.value = data.username;
				profile_picture.value = data.profile_picture;
				rank.value = data.rank;
				for (let req in data.friends)
				{
					if (data.friends[req] === userStore.intra)
						showAmigo.value = false;
				}
				for (let req in data.f_requests)
				{
					console.log(data.f_requests[req]);
					if (data.f_requests[req] === userStore.intra)
						amigoPending.value = true;
				}
			} else {
				router.push('/404');
			}
		} catch (error) {
			console.error('Error fetching user data:', error);
		}
	});

	async function amigofy() {
		if (amigoPending.value)
			alert("friend request still pending");
		else
		{
			await axios.post(`http://${location.hostname}:3000/users/setFRequest`, { intra: intra.value, amigo: userStore.intra, sending: true });
			amigoPending.value = true;
		}
	}

</script>

<style scoped>

	.profile {
		@apply h-full;
	}

	.sidebar {
		@apply flex flex-col items-center justify-start p-8 w-1/5 min-h-full;
	}

	.profile-picture {
		@apply rounded-full object-cover w-48 h-48 my-10;
	}

	.rank {
		@apply w-16 h-auto mt-12;
	}

	.ssd {
		@apply w-32 h-auto mt-12;
	}

	.feature-grid {
		@apply grid w-4/5 max-h-full grid-cols-2;
		height: calc(100vh - 128px);
		/* position: fixed;
		right: 0px; */
		/* @apply border border-blue-300 grid-cols-2 grid-rows-2 gap-4 w-4/5 h-full p-8; */
	}

	.grid-item {
		@apply overflow-auto p-4;
		/* @apply border overflow-auto; */
		/* h-1/4 border-red-300 flex justify-center items-center bg-black bg-opacity-50 rounded-2xl text-3xl */
	}

	.grid-item::-webkit-scrollbar { /* Chrome, Safari and Edge */
		width: 8px;
	}

	.grid-item::-webkit-scrollbar-thumb { /* Chrome, Safari and Edge */
		background: transparent;
	}

	.grid-item::-webkit-scrollbar-thumb:hover { /* Chrome, Safari and Edge */
		background: #fff;
	}

	.profile {
		@apply flex;
	}
	
	/* .name-container {
		@apply flex justify-center w-full;
	} */

	.username-wrapper {
		@apply justify-center inline-flex items-center relative text-4xl;
	}

	.username-text {
		@apply justify-center items-center px-2;
	}

	.content-wrapper {
		@apply flex flex-grow flex-shrink-0 overflow-hidden h-full;
	}

	.friend-button {
		@apply text-green-400 px-4 py-2 text-lg mt-5 bg-white bg-opacity-10;
	}

	.friend-confirmend {
		@apply text-green-400 px-4 py-2 text-lg mt-5 rounded-2xl bg-white bg-opacity-10;
	}

	.friend-button:hover {
		@apply transform scale-110 transition-all duration-300 ease-in-out;
	}

</style>