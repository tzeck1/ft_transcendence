<template>
	<div class="friends-container">
		<h2 class="title">Friends</h2>
		<div v-for="(req, index) in f_requests" :key="req.id" class="friend-item highlight">
			<div class="friend-details relative">
				<div class="animate-ping absolute top-2 left-2 inline-flex h-3 w-3 rounded-full bg-white"></div>
				<div class="picture-container-r" @click="showProfile(req.intra_name)">
					<img class="profile_picture-r" :src="req.profile_picture"/>
				</div>
				<p class="username-r" @click="showProfile(req.intra_name)">{{ req.username }}</p>
				<p class="accept" @click="acceptRequest(req.intra_name)" v-if="showAccept">&#10003;</p>
				<p class="reject" @click="rejectRequest(req.intra_name)" v-if="showAccept">&#10799;</p>
			</div>
		</div>
		<div v-for="(friend, index) in friends" :key="friend.id" class="friend-item">
			<div class="friend-details">
				<div class="picture-container" @click="showProfile(friend.intra_name)">
					<img class="profile_picture" :src="friend.profile_picture"/>
				</div>
				<div class="user-container">
					<p class="username" @click="showProfile(friend.intra_name)">{{ friend.username }}</p>
					<p class="online-status" :class="statusColor(friend.status)">&#11044; {{ friend.status }}</p>
				</div>
				<p class="rank" @click="showProfile(friend.intra_name)">Rank: {{ friend.rank }}</p>
				<div class="remove-container">
					<p class="remove" @click="killFriend(friend.intra_name)" v-if="showAccept">&#10799;</p>
				</div>
			</div>
		</div>
		<!-- <button class="p-2 ml-56 mt-24" @click="test()">test</button> -->
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
		status?: string;
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

	// function test() {
	// 	if (status.value == 'Offline' || status.value == '')
	// 		status.value = 'Online';
	// 	else if (status.value == 'In Game')
	// 		status.value = 'Offline';
	// 	else if (status.value == 'Online')
	// 		status.value = 'In Game';
	// }

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
		userStore.socket!.on("updateFriendStatus", (intra, status) => {
			console.log(intra, 'just went: ', status);
			for (let i in friends.value)
			{
				if (friends.value[i].intra_name == intra) {
					friends.value[i].status = status;
				}
			}
		});
		let friend_intras: string[] = new Array<string>;
		for (let i in friends.value) {
			let f_intra = friends.value[i].intra_name;
			friend_intras.push(f_intra);
		}
		userStore.socket!.emit("getFriendStatus", friend_intras);
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

	let statusColor = (status: string | undefined) => {
		switch (status) {
			case 'Online':
				return 'text-green-400'
			case 'In Game':
				return 'text-yellow-400'
			case 'Offline':
				return 'text-red-400'
			default:
				return ''
		}
	}

</script>

<style scoped>

	.friends-container {
		@apply h-full text-xl overflow-auto;
		scrollbar-width: thin;
		scrollbar-color: transparent transparent;
	}

	.friends-container::-webkit-scrollbar { /* Chrome, Safari and Edge */
		width: 8px;
	}

	.friends-container::-webkit-scrollbar-thumb { /* Chrome, Safari and Edge */
		background: transparent;
	}

	.friends-container::-webkit-scrollbar-thumb:hover { /* Chrome, Safari and Edge */
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
		@apply flex justify-center sm:w-1/4 w-1/3 transition-all duration-300 ease-in-out;
	}

	.picture-container-r {
		@apply flex justify-center w-2/6 transition-all duration-300 ease-in-out;
	}

	.profile_picture-r {
		@apply w-20 h-20 rounded-full object-cover;
	}

	.profile_picture {
		@apply w-20 h-20 rounded-full object-cover;
	}

	.username-r {
		@apply  w-2/6 text-center text-xl transition-all duration-300 ease-in-out;
	}

	.user-container {
		@apply sm:w-1/4 w-1/3 flex flex-col transition-all duration-300 ease-in-out;
	}

	.username {
		@apply text-center text-xl mb-1;
	}

	.online-status {
		@apply text-center text-xs;
	}

	.rank {
		@apply text-center sm:w-1/4 sm:block hidden transition-all duration-300 ease-in-out;
	}

	.accept {
		@apply text-4xl text-green-300 text-center p-2 w-1/6 z-10;
	}

	.reject {
		@apply text-4xl text-red-300 text-center p-2 w-1/6 z-10;
	}

	.remove-container {
		@apply sm:w-1/4 w-1/3 flex justify-center transition-all duration-300 ease-in-out;
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
