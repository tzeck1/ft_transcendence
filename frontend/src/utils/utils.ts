export class utils {
	getUsernameFromCookie() {
		const cookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('username='));
		if (cookie) {
			const usernameJson = cookie.split('=')[1];
			const user_name = JSON.parse(decodeURIComponent(usernameJson));
			return user_name;
		}
		return null;
	}
}