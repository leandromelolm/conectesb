import {checkToken} from './services/auth.js';

window.onload = () => {
    if (checkToken(localStorage.getItem("access_token")).auth) {
        document.querySelectorAll(".logged_in").forEach(function(element) {
            element.classList.add("li__show");
        });
    } else {
        document.querySelectorAll(".logged_out").forEach(function(element) {
            element.classList.add("li__show");
        });
    }
}