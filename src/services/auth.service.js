function checkAuth() {
    try {
        access_token = localStorage.getItem("access_token") || null;
        if (access_token === null) {
            return {auth:false, message: "Usuário não logado"};
        }
        let validToken = checkToken(access_token);       
        if (!validToken.auth) {
            localStorage.removeItem('access_token');
            return {auth:false, message: validToken.message};
        } 
        if(validToken.auth) {
            return {auth:true, id: validToken.id};
        }

    } catch (error) {
        console.log(error);
        return {auth:false, message: error};
    }
}

function checkToken(token) {
    try {
        if (!token)
            return res = {auth: false, message: 'Token nulo'}
        let s = token.split('.');
        let decodeString = atob(s[1]);
        const { exp, username, id } = JSON.parse(decodeString);
        if (new Date(exp * 1000) > new Date()) {
            return res = {
                auth: true,
                message: 'Token válida',
                expira: new Date(exp * 1000),
                username: username,
                id: id
            }
        } else {
            return res = {
                auth: false,
                message: 'Erro na validação do token'
            }
        }        
    } catch (error) {       
        console.log(error);
        return res = {
            auth: false,
            message: 'Erro na validação do token'
        }
    }
}