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
		<button class="auth-intra" @click="auth_intra" v-if="showAuth">
			Authenticate with
			<img src="../assets/42_Logo.png" alt="Icon" class="icon" />
		</button>
		<span v-if="showTFA" class="tfa-text" >Please enter your 2FA code</span>
		<div class="input-container" v-if="showInput">
				<input ref="inputField1" v-model="twoFactorCode[0]" maxlength="1" class="input-2fa" @input="handleInput(0)" @keydown="handleBackspace(0, $event)" type="text">
				<input v-model="twoFactorCode[1]" maxlength="1" class="input-2fa" @input="handleInput(1)" @keydown="handleBackspace(1, $event)" type="text">
				<input v-model="twoFactorCode[2]" maxlength="1" class="input-2fa" @input="handleInput(2)" @keydown="handleBackspace(2, $event)" type="text">
				<input v-model="twoFactorCode[3]" maxlength="1" class="input-2fa" @input="handleInput(3)" @keydown="handleBackspace(3, $event)" type="text">
				<input v-model="twoFactorCode[4]" maxlength="1" class="input-2fa" @input="handleInput(4)" @keydown="handleBackspace(4, $event)" type="text">
				<input v-model="twoFactorCode[5]" maxlength="1" class="input-2fa" @input="handleInput(5)" @keydown="handleBackspace(5, $event)" type="text">
		</div>
		<IntroGame></IntroGame>
	</div>
</template>

<script lang="ts">
	import { ref, defineComponent, onMounted, nextTick } from 'vue';
	import { useRouter } from 'vue-router';
	import { useUserStore } from '../stores/UserStore';
	import axios from 'axios';
	import IntroGame from './IntroGame.vue';

	export default defineComponent({
		name: 'Intro',
		components: {
			IntroGame,
		},

		setup() {
			const store = useUserStore();
			const router = useRouter();
			const twoFactorCode = ref(["", "", "", "", "", ""]);
			const inputField1 = ref<HTMLInputElement | null>(null);
			const showInput = ref(false);
			const showTFA = ref(false);
			const showAuth = ref(true);

			const auth_intra = async () => {
				try {
					const res = await axios.get(`http://${location.hostname}:3000/auth/api42`);
					if (res && res.data && res.data.url) {
						window.location.href = res.data.url;
					} else {
						console.error('Error: URL not received from the backend');
					}
				} catch (error) {
					console.error('Error in auth_intra function:', error);
				}
			};

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
					if (!store.intra)
						store.setIntra(getUsernameFromCookie());
					const response = await axios.get(`http://${location.hostname}:3000/auth/getUserData?intra=${store.intra}`);
					const data = response.data;
					store.setUsername(data.username);
					store.setProfilePicture(data.avatarUrl);
					store.setTFA(data.tfa_enabled);
				} catch (error) {
					console.error('Error fetching user data:', error);
				}

				if (store.tfa_enabled)
				{
					showTFA.value = true;
					showInput.value = true;
					showAuth.value = false;
					await nextTick();
					inputField1.value?.focus();
				}
				else if (store.username && !store.tfa_enabled)
					router.push('/profile');
			});

			async function handleInput(index: number) {
				if (twoFactorCode.value[index].length === 1) {
					if (index < 5) {
						(document.querySelector(`.input-2fa:nth-child(${index + 2})`) as HTMLElement).focus();
					} else {
						const response = await axios.post(`http://${location.hostname}:3000/2fa/verify`, { intra: store.intra, token: twoFactorCode.value.join('') });
						if (response.data.message) {
							router.push('/profile');
						}
						else
							alert("2FA token is invalid!")
							twoFactorCode.value = Array(6).fill('');
							inputField1.value?.focus();
					}
				}
			};

			function handleBackspace(index: number, event: KeyboardEvent) {
				if (event.key === 'Backspace') {
					const previousInput = index - 1;
					if (previousInput >= 0) {
						twoFactorCode[previousInput] = '';
						const inputFields = document.querySelectorAll<HTMLInputElement>('.input-2fa');
						inputFields[previousInput]?.focus();
					}
				}
			};

			return { auth_intra, onMounted, handleInput, handleBackspace, twoFactorCode, inputField1, showInput, showTFA, showAuth };
		},
	});
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

	.tfa-text{
		display: inline-flex;
		align-items: center; 
		margin-top: 8vh;
		margin-bottom: 2vh;
		font-size: 2.5vh;
	}

	.input-container {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1.5vw;
		padding: 1rem;
	}

	.input-2fa {
		font-family: 'ibm-3270';
		width: 2ch;
		background-color: transparent;
		color: white;
		border: 0.5px solid rgb(255, 255, 255);
		text-align: center;
		font-size: 3.5vw;
		outline: none;
		margin-top: 1vh;
	}

</style>