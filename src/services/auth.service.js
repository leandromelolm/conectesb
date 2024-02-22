
function checkAuth() {
    try {
        access_token = localStorage.getItem("access_token") || null;
        if (access_token === null) {
            return false;
            // window.location.href = "../../index.html";
        }
        let validToken = checkToken(access_token);       
        if (!validToken.auth) {
            localStorage.removeItem('access_token');
            return false;
            // window.location.href = '../../index.html';
        } 
        if(validToken.auth) {
            return {auth:true, id: validToken.id};
        }

    } catch (error) {
        console.log(error);
        return false;
        // window.location.href = '../../index.html';
    }
}


function checkToken(token) {
    try {
        let s = token.split('.');
        let decodeString = atob(s[1]);
        const { exp, name, userId } = JSON.parse(decodeString);
        if (new Date(exp * 1000) > new Date()) {
            return res = {
                auth: true,
                message: 'Assinatura válida',
                expira: new Date(exp * 1000),
                username: name,
                id: userId
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