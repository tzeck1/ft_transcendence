// Get the user's name from the URL query string
function getParameterByName(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	const results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
  
  const userName = getParameterByName('name');
  
  // Update the HTML content with the user's name
  document.querySelector('h1').textContent = userName || 'Anonymous';
  
  // Update the profile picture with the user's avatar URL
  const profilePictureElement = document.getElementById('profile-picture');
  const avatarUrl = getParameterByName('avatarUrl');
  
  if (avatarUrl) {
	profilePictureElement.src = avatarUrl;
  } else {
	profilePictureElement.src = '../assets/profile-picture.png';
  }

  const staticText = document.getElementById("username");
  const editableText = document.getElementById("edit-username");
  const toggleButton = document.getElementById("toggle-username");
  
  let isEditing = false;
  
  toggleButton.addEventListener("click", () => {
    isEditing = !isEditing;
    if (isEditing) {
        // Show the input, hide the static text, and copy the text to the input.
        editableText.value = staticText.textContent;
        staticText.style.display = "none";
        editableText.style.display = "inline";
        editableText.focus();

        // Set the cursor position to the end of the input field
        editableText.selectionStart = editableText.selectionEnd = editableText.value.length;

        resizeInput(editableText); // Resize the input when it becomes visible
        toggleButton.textContent = "✔";
    } else {
        // Hide the input, show the static text, and update the static text.
        staticText.textContent = editableText.value;
        editableText.style.display = "none";
        staticText.style.display = "inline";
        toggleButton.textContent = "✎";
    }
});



  function resizeInput(input) {
    input.style.width = (input.value.length + 1) + "ch";
}

const dropArea = document.querySelector(".profile-picture-drop-area");
const profilePicture = document.getElementById("profile-picture");

// Prevent default behavior (Prevent file from being opened)
["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Highlight the drop area when the file is dragged over it
["dragenter", "dragover"].forEach(eventName => {
  dropArea.addEventListener(eventName, highlight, false);
});
["dragleave", "drop"].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
  dropArea.classList.add("highlight");
}

function unhighlight() {
  dropArea.classList.remove("highlight");
}

// Handle the file upload
dropArea.addEventListener("drop", handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const file = dt.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function(event) {
      profilePicture.src = event.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    alert("Please drop an image file.");
  }
}
