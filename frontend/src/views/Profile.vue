<template>
	<div class="profile">
		<div class="content-wrapper" :class="{ blur: qrCodeVisible || showTFA }">
			<div class="sidebar">
				<div class="profile-picture-drop-area" @dragenter.prevent.stop="highlight" @dragover.prevent.stop="highlight" @dragleave.prevent.stop="unhighlight" @drop.prevent.stop="handleDrop">
					<img id="profile-picture" class="profile-picture" :src="profile_picture"/>
					<div class="drop-icon" v-show="showDropIcon">&#x21E3;</div>
				</div>
				<div class="name-container">
					<div class="username-wrapper">
						<h1 class="username-text" v-show="!isEditing">{{ username }}</h1>
						<input ref="usernameInput" @keyup.enter="toggleEditing" v-show="isEditing" v-model="username" @input="resizeInput" type="text" id="edit-username" maxlength="8"/>
						<button @click="toggleEditing" id="toggle-username">
							<span v-show="!isEditing">&#x270E;</span>
							<span v-show="isEditing">&#x2713;</span>
						</button>
					</div>
				</div>
				<span v-if="showUsernameError" class="username-error" >{{ error_text }}</span>
				<img class="rank" src="../assets/ranks/floppy_2.png" alt="Rank" />
				<button class="two-factor-button" @click="toggle2FA">{{ twoFactorButtonText }}</button>
			</div>
			<div class="grid">
				<div class="grid-item">Match History</div>
				<div class="grid-item">Friends</div>
				<div class="grid-item">Achievements</div>
				<div class="grid-item">Statistics</div>
			</div>
		</div>
		<div v-if="qrCodeVisible || showTFA" class="qr-code-overlay" @click="hideQRCode">
		<div class="qr-code-container">
			<img v-if="qrCodeVisible" :src="qrCodeValue" alt="QR Code" class="qr-code">
			<span v-if="showTFA" class="tfa-text" >Please enter your 2FA code</span>
			<div v-if="showTFA" class="input-container">
				<input ref="inputField1" v-model="twoFactorCode[0]" maxlength="1" class="input-2fa" @input="handleInput(0)" @keydown="handleBackspace(0, $event)" type="text">
				<input v-model="twoFactorCode[1]" maxlength="1" class="input-2fa" @input="handleInput(1)" @keydown="handleBackspace(1, $event)" type="text">
				<input v-model="twoFactorCode[2]" maxlength="1" class="input-2fa" @input="handleInput(2)" @keydown="handleBackspace(2, $event)" type="text">
				<input v-model="twoFactorCode[3]" maxlength="1" class="input-2fa" @input="handleInput(3)" @keydown="handleBackspace(3, $event)" type="text">
				<input v-model="twoFactorCode[4]" maxlength="1" class="input-2fa" @input="handleInput(4)" @keydown="handleBackspace(4, $event)" type="text">
				<input v-model="twoFactorCode[5]" maxlength="1" class="input-2fa" @input="handleInput(5)" @keydown="handleBackspace(5, $event)" type="text">
			</div>
			<span v-if="showTFAerror" class="tfa-error" >The 2fa token you entered is invalid!</span>
		</div>
</div>

	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted, watch, nextTick, computed } from 'vue';
	import axios from 'axios';
	import { useUserStore } from '../stores/UserStore';
	import QrcodeVue from 'qrcode.vue';
	import { storeToRefs } from 'pinia';
	import router from '@/router';

	const userStore = useUserStore();
	const { username } = storeToRefs(userStore);
	const { profile_picture } = storeToRefs(userStore);
	const usernameInput = ref<HTMLInputElement | null>(null);
	const inputField1 = ref<HTMLInputElement | null>(null);
	const isEditing = ref(false);
	const input = document.getElementById("edit-username")!;
	const error_text = ref("");
	const showDropIcon = ref(false);
	const qrCodeVisible = ref(false);
	const showTFA = ref(false);
	const showTFAerror = ref(false);
	const showUsernameError = ref(false);
	const qrCodeValue = ref('');
	const twoFactorCode = ref(["", "", "", "", "", ""]);
	const twoFactorButtonText = computed(() => userStore.tfa_enabled ? "Disable 2FA" : "Enable 2FA");

	watch(isEditing, (editing) => {
		if (editing) {
			resizeInput();
		}
	});

	function startEditing() {
		isEditing.value = true;
		nextTick(() => {
			if (usernameInput.value) {
				usernameInput.value.focus();
				usernameInput.value.selectionStart = usernameInput.value.selectionEnd = username.value.length;
			}
		});
	}

	async function stopEditing() {
		const response = await axios.post(`http://${location.hostname}:3000/users/setUsername`, { intra: userStore.intra, username: username.value });
		if (response.data == 1)
		{
			error_text.value = "Username has to contain 2+ chars!";
			showUsernameError.value = true;
		}
		else if (response.data == 2)
		{
			error_text.value = "Username already in use!";
			showUsernameError.value = true;
		}
		else
		{
			isEditing.value = false;
			showUsernameError.value = false;
		}
	}

	function toggleEditing() {
		if (isEditing.value) {
			stopEditing();
		} else {
			startEditing();
		}
	}

	function resizeInput() {
		if (usernameInput.value) {
			usernameInput.value.style.width = (username.value.length + 1) + "ch";
		}
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
		try {
			const cookie_username = getUsernameFromCookie();
			if (!cookie_username)
			{
				router.push('/'); //do we need to return after that?
				return ;
			}
			if (!userStore.intra)
				userStore.setIntra(cookie_username);
			const response = await axios.get(`http://${location.hostname}:3000/auth/getUserData?intra=${userStore.intra}`);
			const data = response.data;
			userStore.setUsername(data.username);
			userStore.setProfilePicture(data.avatarUrl);
			userStore.setTFA(data.tfa_enabled);
		} catch (error) {
			console.error('Error fetching user data:', error);
		}
	});

	function highlight() {
		const dropArea = document.querySelector(".profile-picture-drop-area");
		dropArea?.classList.add("highlight");
		showDropIcon.value = true;
	}

	function unhighlight() {
		const dropArea = document.querySelector(".profile-picture-drop-area");
		dropArea?.classList.remove("highlight");
		showDropIcon.value = false;
	}

	function handleDrop(e: DragEvent) {
		unhighlight();

		const dt = e.dataTransfer;
		if (dt && dt.files && dt.files.length > 0) {
			const file = dt.files[0];
			if (file && file.type.startsWith('image/')) {
				if (file.size > 70000)
				{
					alert('image too large');
					return ;
				}
				const reader = new FileReader();
				reader.onload = function (event) {
					userStore.setProfilePicture(event.target!.result as string);
					axios.post(`http://${location.hostname}:3000/users/setAvatar`, { intra: userStore.intra, picture: userStore.profile_picture });
				};
				reader.readAsDataURL(file);
			} else {
				alert('Please drop an image file.');
			}
		}
	}

	async function toggle2FA() {
		if (userStore.tfa_enabled) {
			await disable2FA();
		} else {
			await enable2FA();
		}
	}

	function hideQRCode() {
		twoFactorCode.value = Array(6).fill('');
		qrCodeVisible.value = false;
		showTFA.value = false;
		showTFAerror.value = false;
	}

	async function enable2FA() {
		const response = await axios.get(`http://${location.hostname}:3000/2fa/enable?intra=${userStore.intra}`);
		const otpauthUrl = response.data.qrCode;
		qrCodeValue.value = otpauthUrl;
		qrCodeVisible.value = true;
		showTFA.value = true;
		await nextTick();
		inputField1.value?.focus();
	}

	async function disable2FA() {
		showTFA.value = true;
		await nextTick();
		inputField1.value?.focus();
	}

	async function verify2FA() {
		const response = await axios.post(`http://${location.hostname}:3000/2fa/verify`, { intra: userStore.intra, token: twoFactorCode.value.join('') });
		if (response.data.message) {
			hideQRCode();
			if (!userStore.tfa_enabled)
				userStore.setTFA(true);
			else {
				await axios.get(`http://${location.hostname}:3000/2fa/disable?intra=${userStore.intra}`);
				userStore.setTFA(false);
			}
		}
		else
			showTFAerror.value = true;

		twoFactorCode.value = Array(6).fill('');
		inputField1.value?.focus();
	}

	async function handleInput(index: number) {
		if (twoFactorCode.value[index].length === 1) {
			if (index < 5) {
				(document.querySelector(`.input-2fa:nth-child(${index + 2})`) as HTMLElement).focus();
			} else
				verify2FA();
		}
	}

	function handleBackspace(index: number, event: KeyboardEvent) {
		if (event.key === 'Backspace') {
			const previousInput = index - 1;
			if (previousInput >= 0) {
				twoFactorCode[previousInput] = '';
				const inputFields = document.querySelectorAll<HTMLInputElement>('.input-2fa');
				inputFields[previousInput]?.focus();
			}
		}
	}

</script>

<style scoped>

	.profile {
		@apply h-full;
	}

	.sidebar {
		@apply flex flex-col items-center justify-start p-8 w-1/5 min-h-full;
	}

	.profile-picture {
		@apply rounded-full object-cover w-48 h-48 my-10;
	}

	.rank {
		@apply w-16 h-auto mt-8;
	}

	.grid {
		@apply grid-cols-2 gap-4 w-4/5 h-full p-8;
		display: grid;
	}

	.grid-item {
		@apply flex justify-center items-center bg-black bg-opacity-50 rounded-2xl text-3xl;
	}

	.profile {
		@apply flex;
	}

	.two-factor-button {
		@apply mt-4 text-2xl;
	}
	
	/* .name-container {
		@apply flex justify-center w-full;
	} */

	.username-wrapper {
		@apply ml-14 justify-center inline-flex items-center relative text-4xl;
	}

	.username-text {
		@apply justify-center items-center px-2;
	}

	#toggle-username {
		@apply p-3 ml-3;
		/* font-family: 'ibm-3270', monospace;
		position: absolute;
		left: 110%;
		top: 50%;
		transform: translateY(-50%);
		background-color: transparent;
		color: white;
		border: none;
		font-size: 3vw;
		cursor: pointer;
		outline: none;
		padding: 5px;
		margin-left: 1vw; */
	}

	#toggle-username:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	#edit-username {
		@apply bg-transparent text-center outline-none;
		/* font-family: 'ibm-3270', monospace;
		background-color: transparent;
		border: none;
		color: white;
		outline: none;
		padding: 0;
		margin: 0;
		width: 1ch;
		text-align: center;
		animation: glowing 3s infinite; */
	}

	.profile-picture-drop-area {
		@apply relative;
	}

	.profile-picture-drop-area.highlight .profile-picture {
		@apply opacity-50;
	}

	.drop-icon {
		@apply text-9xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2;
	}

	.profile-picture-drop-area.highlight .drop-icon {
		@apply block;
	}

	.content-wrapper {
		@apply flex flex-grow flex-shrink-0 overflow-hidden
	}

	.blur {
		filter: blur(5px);
	}

	.qr-code-overlay {
		@apply fixed w-full h-full flex items-center justify-center z-50 top-0 bg-black bg-opacity-50;
	}

	.qr-code-container {
		@apply flex flex-col items-center;
	}

	.qr-code {
		@apply w-full h-full;
	}
	
	.input-container {
		@apply flex gap-4 lg:gap-6;
	}

	.input-2fa {
		@apply w-12 h-12 lg:w-16 lg:h-16 bg-transparent border border-white text-center text-4xl transition-all duration-300 ease-in-out;
	}

	.tfa-text{
		@apply inline-flex text-2xl lg:text-4xl mt-36 mb-4 lg:mb-10 transition-all duration-300 ease-in-out;
	}

	.tfa-error {
		@apply inline-flex text-xl lg:text-2xl text-red-500 mt-6 transition-all duration-300 ease-in-out;
	}



	/* .input-container {
		@apply flex gap-6;
	}

	.input-2fa {
		@apply w-16 h-16 bg-transparent border border-white text-center text-4xl;
	}

	.tfa-text {
		@apply inline-flex text-4xl mt-36 mb-10;
	}

	.tfa-error {
		@apply inline-flex text-2xl text-red-500 mt-6;
	} */
	.username-error {
		@apply inline-flex items-center mt-2 text-xl text-red-500 ;
		text-shadow: 0 0 25px rgb(255, 65, 65);
	}

</style>