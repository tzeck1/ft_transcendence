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

	export default defineComponent({
	name: 'Intro',
	components: {
		IntroGame,
	},
	setup() {
		// Your intro.js code goes here
	},
	methods: {
      auth_intra() {
        window.location.href = 'http://localhost:3000/auth/api42';
      },
	},
	})
</script>

<style scoped>
	.auth-intra {
		display: inline-flex;
		align-items: center; 
		margin-top: 2vw;
		margin-bottom: 2vw;
	}

	.intro {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		margin-top: 5vw;
	}

	.intro h1 {
		font-size: 4vw;
		/* margin-top: 1vw; */
	}

	.intro p {
		font-size: 1.5vw;
		margin-top: 2vw;
	}
	
	.intro a {
		color: white;
		text-decoration: none;
	}
</style>