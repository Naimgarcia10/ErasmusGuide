import { logoutUser } from "./usersManagement.js";

if (sessionStorage.getItem('role')){
    const userBoxLogin = document.getElementById('user-box-login');
    userBoxLogin.style.display = 'none';
    const userBoxLogout = document.getElementById('user-box-logout');
    userBoxLogout.style.display = 'block';
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', logoutUser);
}