<template>
	<div class="profile">
		<div class="sidebar">
			<div class="profile-picture-drop-area" @dragenter.prevent.stop="highlight" @dragover.prevent.stop="highlight" @dragleave.prevent.stop="unhighlight" @drop.prevent.stop="handleDrop">
			<img id="profile-picture" class="profile-picture" :src="profilePictureSrc" alt="Profile picture" />
			<div class="drop-icon" v-show="showDropIcon">&#x21E3;</div>
		</div>
		<div class="name-container">
		  <div class="username-wrapper">
			<h1 v-show="!isEditing">{{ userName }}</h1>
			<input ref="usernameInput" v-show="isEditing" v-model="userName" @input="resizeInput" type="text" id="edit-username"/>
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

	const usernameInput = ref<HTMLInputElement | null>(null);
	const profilePictureSrc = ref('../assets/profile-picture.png');
	const userName = ref('Totoro');
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
		usernameInput.value.style.width =
		(userName.value.length + 1) + "ch";
	}
	}
  
  onMounted(() => {
	// Add your logic to retrieve the initial userName and profilePictureSrc values from URL parameters or other sources here
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
		  profilePictureSrc.value = event.target!.result as string;
		};
		reader.readAsDataURL(file);
	  } else {
		alert('Please drop an image file.');
	  }
	}
  }
  </script>