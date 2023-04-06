document.addEventListener('DOMContentLoaded', () => {
	function getUrlParams(url) {
	  const params = {};
	  const parser = document.createElement('a');
	  parser.href = url;
	  const query = parser.search.substring(1);
	  const pairs = query.split('&');
  
	  for (let i = 0; i < pairs.length; i++) {
		const pair = pairs[i].split('=');
		params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
	  }
  
	  return params;
	}
  
	const params = getUrlParams(window.location.href);
	console.log(params);
  
	// Update the user's name
	const userName = document.querySelector('h1');
	userName.textContent = params.name || 'Unknown';
  
	// Update the user's profile picture
	const profilePicture = document.querySelector('.profile-picture');
	profilePicture.src = params.avatarUrl || '../assets/profile-picture.png';
  });