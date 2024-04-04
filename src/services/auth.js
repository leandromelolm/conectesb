export function checkToken(token) {
    try {
        if (!token)
            return {auth: false, message: 'Token nulo'}
        let s = token.split('.');
        var decodeString = atob(s[1]);
        const { exp, username, userId } = JSON.parse(decodeString);
    
        if (new Date(exp * 1000) > new Date()) {
            return {
                auth: true,
                message: 'Assinatura válida',
                expira: new Date(exp * 1000),
                username: username,
                id: userId
            };
        } else {
            return {
                auth: false,
                message: 'Erro na validação do token'
            };
        }        
    } catch (error) {
        return {
            auth: false,
            message: 'Erro na validação do token'
        };
    }
    
}