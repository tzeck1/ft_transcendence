<template>
	<div class="friends-container">
		<h2 class="title">Friends</h2>
		<div v-for="(req, index) in f_requests" :key="req.id" class="friend-item" :class="{'highlight': index % 2 === 0}">
			<div class="friend-details">
				<div class="picture-container" @click="showProfile(req.intra_name)">
					<img class="profile_picture" :src="req.profile_picture"/>
				</div>
				<p class="username" @click="showProfile(req.intra_name)">{{ req.username }}</p>
				<p class="accept" @click="acceptRequest(req.intra_name)" v-if="showAccept">&#10003;</p>
				<p class="reject" @click="rejectRequest(req.intra_name)" v-if="showAccept">&#10799;</p>
			</div>
		</div>
		<div v-for="(friend, index) in friends" :key="friend.id" class="friend-item" :class="{'highlight': index % 2 === 0}">
			<div class="friend-details">
				<div class="picture-container" @click="showProfile(friend.intra_name)">
					<img class="profile_picture" :src="friend.profile_picture"/>
				</div>
				<p class="username" @click="showProfile(friend.intra_name)">{{ friend.username }}</p>
				<p class="rank" @click="showProfile(friend.intra_name)">Rank: {{ friend.rank }}</p>
				<div class="remove-container">
					<p class="remove" @click="killFriend(friend.intra_name)" v-if="showAccept">&#10799;</p>
				</div>
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

	interface Friend {
		id: number;
		intra_name: string;
		username: string;
		profile_picture: string;
		rank: number;
	}

	interface F_request {
		id: number;
		intra_name: string;
		username: string;
		profile_picture: string;
		rank: number;
	}

	const userStore = useUserStore();
	const friends = ref<Friend[]>([]);
	const f_requests = ref<F_request[]>([]);
	const showAccept = ref(true);

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
		if (!userStore.intra)
			userStore.setIntra(cookie_username);
		const reqs = await axios.get(`http://${location.hostname}:3000/users/getFRequests?intra=${userStore.intra}`);
		f_requests.value = reqs.data;
		const userData = await axios.get(`http://${location.hostname}:3000/users/getUsers`);
		let users = userData.data;
		for (let user in users)
		{
			// console.log("user: " + users[user].value)
			// console.log("user friends: " + users[user].friends)
			if (users[user].friends.includes(userStore.intra))
				friends.value.push(users[user]);
		}
		console.log(friends.value);
	});

	async function acceptRequest(amigo_intra: string) {
		await axios.post(`http://${location.hostname}:3000/users/setFriends`, {intra: userStore.intra, amigo: amigo_intra});
		showAccept.value = false;
		f_requests.value = f_requests.value.filter((element) => element.intra_name !== amigo_intra);
		console.log(f_requests.value);
	}

	async function rejectRequest(amigo_intra: string) {
		await axios.post(`http://${location.hostname}:3000/users/setFRequest`, { intra: userStore.intra, amigo: amigo_intra, sending: false });
		showAccept.value = false;
		f_requests.value = f_requests.value.filter((element) => element.intra_name !== amigo_intra);
	}
	
	async function killFriend(amigo_intra: string) {
		let newFriends = await axios.post(`http://${location.hostname}:3000/users/killFriend`, { intra: userStore.intra, amigo: amigo_intra });
		friends.value = newFriends.data;
	}

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

	.title {
		@apply flex items-center justify-center text-3xl font-bold text-center mb-8 ;
	}

	.friend-details {
		@apply flex flex-row items-center py-2.5;
	}

	.friend-details:hover {
		@apply cursor-pointer;
	}

	.picture-container {
		@apply flex justify-center w-1/4;
	}

	.profile_picture {
		@apply w-20 h-20 rounded-full object-cover;
	}

	.username {
		@apply text-center w-1/4;
	}

	.rank {
		@apply text-center w-1/4;
	}

	.accept {
		@apply text-4xl text-green-300 text-center p-2 w-1/6 z-10;
	}

	.reject {
		@apply text-4xl text-red-300 text-center p-2 w-1/6 z-10;
	}

	.remove-container {
		@apply w-1/4 flex justify-center;
	}

	.remove {
		@apply w-1/4 text-xl text-red-400 text-opacity-70 flex justify-center;
	}

	.remove:hover {
		@apply bg-white bg-opacity-10 rounded-lg;
	}

	.accept:hover {
		@apply cursor-wait;
	}

	.highlight {
		@apply bg-white bg-opacity-10;
	}

</style>
