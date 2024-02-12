
function checkAuth() {
    try {
        access_token = localStorage.getItem("access_token") || null;
        if (access_token === null) {
            return false;
            // window.location.href = "../../index.html";
        }
        let validToken = checkTokenExpirationDate(access_token);       
        if (!validToken.auth) {
            localStorage.removeItem('access_token');
            return false;
            // window.location.href = '../../index.html';
        } 
        if(validToken.auth) {
            console.log("token válido");
            return true;
        }

    } catch (error) {
        console.log(error);
        return false;
        // window.location.href = '../../index.html';
    }
}


function checkTokenExpirationDate(token) {
    try {
        let s = token.split('.');
        let decodeString = atob(s[1]);
        const { exp, name } = JSON.parse(decodeString);
        if (new Date(exp * 1000) > new Date()) {
            return res = {
                auth: true,
                message: 'Valid signature',
                expira: new Date(exp * 1000),
                username: name
            }
        } else {
            return res = {
                auth: false,
                message: 'The token has expired'
            }
        }        
    } catch (error) {       
        console.log(error);
    }
}