
function checkAuth() {
    try {
        access_token = localStorage.getItem("access_token") || null;
        if (access_token === null) {
            return {auth:false, message: "Usuário não logado"};
            // window.location.href = "../../index.html";
        }
        let validToken = checkToken(access_token);       
        if (!validToken.auth) {
            localStorage.removeItem('access_token');
            return {auth:false, message: validToken.message};
            // window.location.href = '../../index.html';
        } 
        if(validToken.auth) {
            return {auth:true, id: validToken.id};
        }

    } catch (error) {
        console.log(error);
        return {auth:false, message: error};
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
                message: 'Token válida',
                expira: new Date(exp * 1000),
                username: name,
                id: userId
            }
        } else {
            return res = {
                auth: false,
                message: 'Token expirado'
            }
        }        
    } catch (error) {       
        console.log(error);
        return res = {
            auth: false,
            message: `Erro na verificação do token, ${error}`
        }
    }
}