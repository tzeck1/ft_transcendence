<template>
	<div class="intro">
		<h1>ft_transcendence</h1>
		<p>
			<a href="https://github.com/benzlinger" target="_blank">btenzlin</a> •
			<a href="https://github.com/tzeck1" target="_blank">tzeck</a> •
			<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">rsiebert</a> •
			<a href="https://github.com/mmeising" target="_blank">mmeising</a> •
			<a href="https://github.com/eschirni" target="_blank">eschirni</a>
		</p>
		<button class="auth-intra" @click="auth_intra">
			Authenticate with
			<img src="../assets/42_Logo.png" alt="Icon" class="icon" />
		</button>
		<IntroGame></IntroGame>
	</div>
</template>

<script lang="ts">
	import { defineComponent } from 'vue'
	import IntroGame from "./IntroGame.vue"
	import axios from 'axios';
	import { useUserStore } from '../stores/UserStore';

	const store = useUserStore();

	export default defineComponent({
		name: 'Intro',
		components: {
			IntroGame,
		},
		setup() {
			// Your intro.js code goes here
		},
		methods: {
			async auth_intra() {
				try {
					const res = await axios.get('http://localhost:3000/auth/api42');
					if (res && res.data && res.data.url) {
						window.location.href = res.data.url;
						const username = this.getUsernameFromCookie();
						store.setUsername(username);
					} 
					else {
						console.error('Error: URL not received from the backend');
					}
				} catch (error) {
					console.error('Error in auth_intra function:', error);
				}
			},

			getUsernameFromCookie() {
				const cookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('username='));
				if (cookie) {
					const usernameJson = cookie.split('=')[1];
					const username = JSON.parse(decodeURIComponent(usernameJson));
					return username;
				}
				// else
				// 	alert('Cookie is empty');
				return null;
			}
		},
	})
</script>

<style scoped>
	.auth-intra {
		display: inline-flex;
		align-items: center; 
		margin-top: 8vh;
		margin-bottom: 2vh;
	}

	.intro {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		margin-top: 5vh;
	}

	.intro h1 {
		font-size: 4vh;
		/* margin-top: 1vh; */
	}

	.intro p {
		font-size: 1.5vh;
		margin-top: 2vh;
	}
	
	.intro a {
		color: white;
		text-decoration: none;
	}
</style>