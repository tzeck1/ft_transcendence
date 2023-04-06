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