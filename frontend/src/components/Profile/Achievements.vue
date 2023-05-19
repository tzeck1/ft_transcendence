<template>
	<div class="achievements-container">
		<h2 class="title">Achievements</h2>
		<div class="achievements-list">
			<div class="achievements-item" :class="{'completed': gamesWon}">
				<div class="logo">
					<img src="../../assets/joystick.png"/>
				</div>
				<div class="text">
					<h1>Champion in the Making</h1>
					<span>Win 10 competetive Games!</span>
				</div>
				<span class="check" v-if="gamesWon">&#10003;</span>
			</div>
			<div class="achievements-item" :class="{'completed': friends}">
				<img src="../../assets/addfriend.png" class="friend-logo"/>
				<div class="text">
					<h1>Zuckerberg in Training</h1>
					<span>Connect with 5 New Friends!</span>
				</div>
				<span class="check" v-if="friends">&#10003;</span>
			</div>
			<div class="achievements-item" :class="{'completed': ladder}">
				<img src="../../assets/trophy.png"/>
				<div class="text">
					<h1>Ascend to the Elite</h1>
					<span>Secure Your Spot in the Top 3!</span>
				</div>
				<span class="check" v-if="ladder">&#10003;</span>
			</div>
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
	const route = useRoute();
	const gamesWon = ref(false);
	const friends = ref(false);
	const ladder = ref(false);

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
		let intra = '';
		if (!route.params.username) {
			intra = userStore.intra;
		}
		else {
			intra = route.params.username.toString();
		}
		const winData = await axios.get(`http://${location.hostname}:3000/users/getUser?intra=${intra}`);
		if (winData.data.games_won >= 10)
			gamesWon.value = true;
			const userData = await axios.get(`http://${location.hostname}:3000/users/getUsers`);
			for (let i = 0; i < 3; i++) {
				if (userStore.intra === userData.data[i].intra_name)
					ladder.value = true;
				}
		//code

	});
</script>

<style scoped>

.achievements-container {
	/* @apply animate-spin; */
	scrollbar-width: thin;
	scrollbar-color: transparent transparent;
}

.title {
	@apply text-3xl font-bold text-center mb-12;
}

.achievements-list {
	@apply flex flex-col items-center h-full pb-12;
}

.achievements-item {
	@apply flex flex-row justify-start gap-16 items-center w-full h-1/3;
}

h1 {
	@apply font-bold text-xl mb-5;
}

img {
	@apply w-24 h-auto;
}

span {
	@apply text-gray-200;
}

.friend-logo {
	@apply p-3;
}

.completed {
	@apply bg-white bg-opacity-10;
}

.check {
	@apply text-6xl  w-1/4;
}

.logo {
	@apply h-full w-1/2;
}

.text {
	@apply w-1/4;
}

</style>
