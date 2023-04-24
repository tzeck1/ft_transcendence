<template>
	<div class="profile">
		<div class="content-wrapper" :class="{ blur: qrCodeVisible || showTFA }">
			<div class="sidebar">
				<div class="profile-picture-drop-area" @dragenter.prevent.stop="highlight" @dragover.prevent.stop="highlight" @dragleave.prevent.stop="unhighlight" @drop.prevent.stop="handleDrop">
					<img id="profile-picture" class="profile-picture" :src="profile_picture" alt="Profile picture" />
					<div class="drop-icon" v-show="showDropIcon">&#x21E3;</div>
				</div>
				<div class="name-container">
					<div class="username-wrapper">
						<h1 v-show="!isEditing">{{ username }}</h1>
						<input ref="usernameInput" v-show="isEditing" v-model="username" @input="resizeInput" type="text" id="edit-username"/>
						<button @click="toggleEditing" id="toggle-username">
							<span v-show="!isEditing">&#x270E;</span>
							<span v-show="isEditing">&#x2713;</span>
						</button>
					</div>
				</div>
				<span v-if="showUsernameError" class="username-error" >Username already in use!</span>
				<img class="rank" src="../assets/rank.png" alt="Rank" />
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

	const store = useUserStore();
	const { username } = storeToRefs(store);
	const { profile_picture } = storeToRefs(store);
	const usernameInput = ref<HTMLInputElement | null>(null);
	const inputField1 = ref<HTMLInputElement | null>(null);
	const isEditing = ref(false);
	const showDropIcon = ref(false);
	const qrCodeVisible = ref(false);
	const showTFA = ref(false);
	const showTFAerror = ref(false);
	const showUsernameError = ref(false);
	const qrCodeValue = ref('');
	const twoFactorCode = ref(["", "", "", "", "", ""]);
	const twoFactorButtonText = computed(() => store.tfa_enabled ? "Disable 2FA" : "Enable 2FA");

	watch(isEditing, (editing) => {
		if (editing) {
			resizeInput();
		}
	});

	function startEditing() {
		isEditing.value = true;
	}

	async function stopEditing() {
		// alert(usernameInput.value);
		const response = await axios.post(`http://${location.hostname}:3000/users/setUsername`, { intra: store.intra, username: username.value });
		if (response.data)
		{
			isEditing.value = false;
			showUsernameError.value = false;
		}
		else
			showUsernameError.value = true;
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
				const reader = new FileReader();
				reader.onload = function (event) {
					store.setProfilePicture(event.target!.result as string);
					axios.post(`http://${location.hostname}:3000/users/setAvatar`, { intra: store.intra, picture: store.profile_picture });
				};
				reader.readAsDataURL(file);
			} else {
				alert('Please drop an image file.');
			}
		}
	}

	async function toggle2FA() {
		if (store.tfa_enabled) {
			await disable2FA();
		} else {
			await enable2FA();
		}
	}

	function hideQRCode() {
		qrCodeVisible.value = false;
		showTFA.value = false;
		showTFAerror.value = false;
	}

	async function enable2FA() {
		const response = await axios.get(`http://${location.hostname}:3000/2fa/enable?intra=${store.intra}`);
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
		const response = await axios.post(`http://${location.hostname}:3000/2fa/verify`, { intra: store.intra, token: twoFactorCode.value.join('') });
		if (response.data.message) {
			hideQRCode();
			if (!store.tfa_enabled)
				store.setTFA(true);
			else {
				await axios.get(`http://${location.hostname}:3000/2fa/disable?intra=${store.intra}`);
				store.setTFA(false);
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
	.sidebar {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		width: 20%;
		min-height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.profile-picture {
		width: 15vw;
		height: 15vw;
		border-radius: 50%;
		margin-top: 2vw;
		margin-bottom: 2vw;
	}

	.rank {
		width: 5vw;
		height: 5vw;
		margin-top: 2vw;
		margin-bottom: 1vw;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-gap: 1rem;
		width: 80%;
		padding: 2rem;
		overflow-y: auto;
		height: 100%;
	}

	.grid-item {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 25px;
		padding: 1rem;
		font-size: 1.5vw;
	}

	.profile {
		display: flex;
		flex-grow: 1;
		flex-shrink: 0;
		overflow: hidden;
	}

	.two-factor-button {
		margin-top: auto;
	}
	
	.name-container {
		display: flex;
		justify-content: center;
		width: 100%;
	}

	.username-wrapper {
		display: inline-flex;
		position: relative;
		font-size: 1.25vw;
	}

	#username span {
		position: relative;
		z-index: 1;
	}

	#toggle-username {
		font-family: 'ibm-3270', monospace;
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
		margin-left: 1vw;
	}

	#toggle-username:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	#edit-username {
		font-family: 'ibm-3270', monospace;
		font-size: 2.5vw;
		background-color: transparent;
		border: none;
		color: white;
		outline: none;
		padding: 0;
		margin: 0;
		width: 1ch;
		text-align: center;
		animation: glowing 3s infinite;
	}

	.profile-picture-drop-area {
		position: relative;
	}

	.profile-picture-drop-area.highlight .profile-picture {
		opacity: 0.5;
	}

	.drop-icon {
		display: none;
		font-size: 15rem;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
	}

	.profile-picture-drop-area.highlight .drop-icon {
		display: block;
	}

	.content-wrapper {
		display: flex;
		flex-grow: 1;
		flex-shrink: 0;
		overflow: hidden;
	}

	.blur {
		filter: blur(5px);
	}

	.qr-code-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
	}

	.qr-code-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.qr-code {
		width: 30vw;
		height: 30vw;
		object-fit: contain;
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

	.tfa-text {
		display: inline-flex;
		align-items: center; 
		margin-top: 8vh;
		margin-bottom: 2vh;
		font-size: 2.5vh;
	}

	.tfa-error {
		display: inline-flex;
		align-items: center; 
		margin-top: 1vh;
		font-size: 1.5vh;
		color: rgb(247, 65, 65);
		animation: glowing-error 3s infinite;
	}
	.username-error {
		display: inline-flex;
		align-items: center; 
		margin-top: 1.5vh;
		font-size: 1.19vh;
		color: rgb(247, 65, 65);
		animation: glowing-error 3s infinite;
	}

</style>