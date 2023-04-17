<template>
	<div class="profile">
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
		<img class="rank" src="../assets/rank.png" alt="Rank" />
		<button class="two-factor-button">Enable 2FA</button>
	  </div>
	  <div class="grid">
		<div class="grid-item">Match History</div>
		<div class="grid-item">Friends</div>
		<div class="grid-item">Achievements</div>
		<div class="grid-item">Statistics</div>
	  </div>
	</div>
  </template>
  
  <script setup lang="ts">
	import { ref, onMounted, watch } from 'vue';
	import axios, { HttpStatusCode } from 'axios';
	import { useUserStore } from '../stores/UserStore';
	import { storeToRefs } from 'pinia';

	const store = useUserStore();
	const { username } = storeToRefs(store);
	const { profile_picture } = storeToRefs(store);
	const usernameInput = ref<HTMLInputElement | null>(null);
	const isEditing = ref(false);
	const showDropIcon = ref(false);

	watch(isEditing, (editing) => {
	if (editing) {
		resizeInput();
	}
	});

	function startEditing() {
		isEditing.value = true;
	}

	function stopEditing() {
		isEditing.value = false;
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
		const response = await axios.get(`http://localhost:3000/auth/getUserData?intra=${store.intra}`);
		const data = response.data;
		store.setUsername(data.username);
		store.setProfilePicture(data.avatarUrl);
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
			axios.post('http://localhost:3000/users/setAvatar', { intra: store.intra, picture: store.profile_picture });
			// .then(function (response) {
			// 	alert(response);
			// })
			// .catch(function (error) {
			// 	alert(error);
			// })
		};
		reader.readAsDataURL(file);
	  } else {
		alert('Please drop an image file.');
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
		font-size: 2.5vw;
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
		font-size: 2vw;
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
</style>