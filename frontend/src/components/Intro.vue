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
			<img src="../assets/42_Logo.ico" alt="Icon" class="icon" /> Authenticate with 42 Intra
		</button>
	</div>
</template>

<script lang="ts">
	import { defineComponent } from 'vue'

	export default defineComponent({
	name: 'Intro',
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