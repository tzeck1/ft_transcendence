<template>
	<div class="achievements-container">
		<h2 class="title">Achievements</h2>
		<div class="achievements-list">
			<div class="achievements-item" :class="{'completed': gamesWon}">
				<div class="logo">
					<img src="../../assets/achievements/joystick.png"/>
				</div>
				<div class="text">
					<h1>Champion in the Making</h1>
					<span>Win 10 competetive Games!</span>
				</div>
				<span class="check" v-if="gamesWon">&#10003;</span>
			</div>
			<div class="achievements-item" :class="{'completed': ladder}">
				<div class="logo">
					<img src="../../assets/achievements/trophy.png"/>
				</div>
				<div class="text" :class="{'rainbow_text_animated': ladder}">
					<h1>Ascend to the Elite</h1>
					<span>Secure Your Spot in the Top 3!</span>
				</div>
				<span class="check" v-if="ladder">&#10003;</span>
			</div>
			<div class="achievements-item" :class="{'completed': friends}">
				<div class="logo">
					<img src="../../assets/achievements/addfriend.png" class="friend-logo"/>
				</div>
				<div class="text">
					<h1>Zuckerberg in Training</h1>
					<span>Connect with 5 New Friends!</span>
				</div>
				<span class="check" v-if="friends">&#10003;</span>
			</div>
			<div class="achievements-item" :class="{'completed': hackerman}">
				<div class="logo">
					<img src="../../assets/achievements/hackerman.png"/>
				</div>
				<div class="text" :class="{'rainbow_text_animated': hackerman}">
					<h1>Hackerman</h1>
					<span>???</span>
				</div>
				<span class="check" v-if="hackerman">&#10003;</span>
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
	const hackerman = ref(false);

	const getUsernameFromCookie = () => {
		const cookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('username='));
		if (cookie) {
			const usernameJson = cookie.split('=')[1];
			const user_name = JSON.parse(decodeURIComponent(usernameJson));
			return user_name;
		}
		return null;
	};

	async function getLadder() {
		const users = await axios.get(`http://${location.hostname}:3000/users/getUsers`);
		for (let i = 0; i < 3; i++) {
			if (!users.data[i])
				break ;
			if (userStore.intra === users.data[i].intra_name)
				return true;
		}
		return false;
	}

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
		const userData = await axios.get(`http://${location.hostname}:3000/users/getUser?intra=${intra}`);
		gamesWon.value = userData.data.ten_comp;
		friends.value = userData.data.zucc;
		ladder.value = userData.data.top_three;
		hackerman.value = userData.data.hackerman;

		if (!gamesWon.value && userData.data.games_won >= 10) {
			axios.post(`http://${location.hostname}:3000/users/setTenComp`, { intra: intra });
			gamesWon.value = true;
		}
		if (!ladder.value && await getLadder()) {
			axios.post(`http://${location.hostname}:3000/users/setTopThree`, { intra: intra });
			ladder.value = true;
		}
		if (!friends.value && userData.data.friends.length >= 5) {
			axios.post(`http://${location.hostname}:3000/users/setZucc`, { intra: intra });
			friends.value = true;
		}
	});
</script>

<style scoped>

.achievements-container {
	@apply flex h-full flex-col items-center justify-center;
	scrollbar-width: thin;
	scrollbar-color: transparent transparent;
}

.title {
	@apply flex items-center justify-center text-3xl font-bold text-center mb-8 ;
}

.achievements-list {
	@apply w-full flex flex-col items-center h-full;
}

.achievements-item {
	@apply flex flex-row w-full h-1/4;
}

h1 {
	@apply font-bold xl:text-xl text-lg mb-5 transition-all duration-300 ease-in-out;
}

img {
	@apply w-24 h-auto;
}

span {
	@apply xl:text-base text-sm text-gray-200 transition-all duration-300 ease-in-out;
}

.friend-logo {
	@apply p-3;
}

.completed {
	@apply bg-white bg-opacity-10;
}

.check {
	@apply flex items-center justify-center text-6xl  w-1/5;
}

.logo {
	@apply flex items-center justify-center h-full w-1/5;
}

.text {
	@apply flex flex-col items-center justify-center w-3/5;
	/* white-space: nowrap; */
}
.rainbow_text_animated {
    background: linear-gradient(to right, #6666ff, #0099ff , #00ff00, #ff3399, #6666ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: rainbow_animation 3s ease-in-out infinite;
    background-size: 400% 100%;
}

@keyframes rainbow_animation {
    0%,100% {
        background-position: 0 0;
    }

    50% {
        background-position: 100% 0;
    }
}

</style>
