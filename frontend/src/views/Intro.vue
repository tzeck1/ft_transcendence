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
		<span v-if="showTFAerror" class="tfa-error" >The 2fa token you entered is invalid!</span>
		<IntroGame></IntroGame>
	</div>
</template>

<script lang="ts">
	import { ref, defineComponent, onMounted, nextTick } from 'vue';
	import { useRouter } from 'vue-router';
	import { useUserStore } from '../stores/UserStore';
	import axios from 'axios';
	import IntroGame from '../components/IntroArt.vue';

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
			const showTFAerror = ref(false);
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
					if (getUsernameFromCookie()) {
						store.setIntra(getUsernameFromCookie());
						const response = await axios.get(`http://${location.hostname}:3000/auth/getUserData?intra=${store.intra}`);
						const data = response.data;
						store.setUsername(data.username);
						store.setProfilePicture(data.avatarUrl);
						store.setTFA(data.tfa_enabled);
					}
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
							showTFAerror.value = true;
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

			return { auth_intra, onMounted, handleInput, handleBackspace, twoFactorCode, inputField1, showInput, showTFA, showTFAerror, showAuth };
		},
	});
</script>


<style scoped>

	@font-face {
		font-family: ibm-3270;
		src: url('./assets/3270-Regular.ttf') format('truetype');
	}

	.intro {
		@apply h-full justify-center flex flex-col items-center transition-all duration-300 ease-in-out;
		font-family: 'ibm-3270', monospace;
	}

	button:hover {
		@apply bg-white bg-opacity-10;
	}

	.auth-intra {
		@apply text-2xl lg:text-4xl animate-pulse inline-flex items-center mt-16 transition-all duration-300 ease-in-out;
	}

	.icon {
		@apply justify-center align-middle w-11 h-auto ml-4;
	}

	.intro h1 {
		@apply text-5xl lg:text-6xl mb-4 transition-all duration-300 ease-in-out;
	}

	.intro p {
		@apply text-base lg:text-2xl mb-6 transition-all duration-300 ease-in-out;
	}

	.tfa-text{
		@apply inline-flex text-4xl mt-36 mb-10;
	}

	.tfa-error {
		@apply inline-flex text-2xl text-red-500 mt-6;
	}

	.input-container {
		@apply flex gap-6;
	}

	.input-2fa {
		@apply w-16 h-16 bg-transparent border border-white text-center text-4xl;
	}

</style>