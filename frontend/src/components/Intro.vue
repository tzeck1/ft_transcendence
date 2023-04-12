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