import {checkToken} from './services/auth.js';

window.onload = () => {

    // const url = new URL(window.location.href);
    // if (url.hostname === "sbpedido.netlify.app") {
    //     window.location.replace("https://conectesb.netlify.app");
    // }

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