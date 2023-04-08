const profileButton = document.getElementById("profileButton");

profileButton.addEventListener("click", function() {
  // Add the active class to the profile button
  profileButton.classList.add("active-button");

  fetch("profile.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("content").innerHTML = html;
      const scriptTag = document.createElement("script");
      scriptTag.src = "profile.js";
      document.body.appendChild(scriptTag);
    });
});

const logoutButton = document.querySelector(".logout-button");
logoutButton.addEventListener("click", function() {
  // Remove the active class from the profile button
  profileButton.classList.remove("active-button");

  document.getElementById("content").innerHTML = `
  <div class="intro">
    <h1>ft_transcendence</h1>
    <p>
      <a href="https://github.com/benzlinger" target="_blank">btenzlin</a> •
      <a href="https://github.com/tzeck1" target="_blank">tzeck</a> •
      <a href="https://github.com/cptbboy" target="_blank">rsiebert</a> •
      <a href="https://github.com/mmeising" target="_blank">mmeising</a> •
      <a href="https://github.com/eschirni" target="_blank">eschirni</a>
    </p>
  </div>`;
});
