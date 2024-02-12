const headerTemplate = document.createElement('template');
let booleanPaginaEstoque = false;

headerTemplate.innerHTML = `
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
<style>
nav {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color:  #0051A2 !important;
    padding-left: 0 !important;
}

.navbar-expand-md .navbar-nav .nav-link {
    padding-left: 0 !important;
}

a {
    font-size: small;
    font-weight: 700;
    margin: 0 5px;
    color: white !important;
    text-decoration: none;
}

a:hover {
    box-shadow: inset 0 -2px 0 0 #fff;
    color: cyan !important;
}

.navbar-toggler-icon {
    filter: invert(1);
}

.div__user-login {
    align-items: center;
    font-size: 16px;
}
</style>
<header>
    <div>
        <nav class="navbar navbar-expand-md navbar-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="index.html">ConecteSB</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false"
                    aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse justify-content-between" id="navbarNavAltMarkup">
                    <div class="navbar-nav">
                        <a class="nav-link active" aria-current="page"  href="pedido-fazer.html">Fazer Pedido</a>
                        <a class="nav-link active" href="pedido-lista.html">Lista de Pedidos</a>
                        <a class="show_logged_in_only d-none nav-link active" href="abrirchamado.html">Abrir Chamado</a>
                        <a class="a__buscar-chamado d-none nav-link active" href="buscarchamado.html">Buscar Chamado</a>
                        <a class="a__gerenciar-estoque d-none nav-link active" href="user/admin/estoque-admin.html">Gerenciar Estoque</a>
                        <a class="nav-link active" href="inventario-fazer.html"> Fazer Inventário</a>
                        <a class="nav-link active" href="inventario-lista?search=all"> Lista de Inventários</a>
                        <a class="nav-link active d-none a__inventario-buscar" href="inventario-buscar?search=all">Buscar Inventários</a>
                    </div>
                    <div class="div__user-login d-flex flex-row-reverse d-none">
                        <button class="btn btn-light ms-1 rounded-pill" onclick="logout()">Sair</button>             
                    </div> 
                </div>
            </div>
        </nav>
    </div>
</header>
`;

class Header extends HTMLElement {
    constructor() {
        super();
    }

    

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'closed' });
        shadowRoot.appendChild(headerTemplate.content);

        // Verificar se a página está na subpasta "user/sign-in"
        const currentPath = window.location.pathname;
        const isInLoginPage = currentPath.indexOf("/user/sign-in") !== -1;
        const isInEstoquePage = currentPath.indexOf("/user/admin/estoque-admin") !== -1;

        if (isInLoginPage) {
            // Atualizar os links removendo "user/"
            const links = shadowRoot.querySelectorAll('a');
            links.forEach((link) => {
                link.href = link.href.replace("/user/", "/");
            });
        }

        if (isInEstoquePage) {
            booleanPaginaEstoque = isInEstoquePage;
            const links = shadowRoot.querySelectorAll('a');
            links.forEach((link) => {
                link.href = link.href.replace("/user/admin/", "/");
            });
        }

        // Inicializar o Bootstrap Collapse usando JavaScript puro
        const toggleButton = shadowRoot.querySelector('.navbar-toggler');
        const collapseElement = shadowRoot.querySelector('.navbar-collapse');

        toggleButton.addEventListener('click', () => {
            collapseElement.classList.toggle('show');
        });

        // Fechar o menu ao clicar em um link
        const links = shadowRoot.querySelectorAll('.nav-link');
        links.forEach((link) => {
            link.addEventListener('click', () => {
                collapseElement.classList.remove('show');
            });
        });
        const usuarioLogadoElement = document.createElement('span');
        usuarioLogadoElement.id = 'usuarioLogado';
        usuarioLogadoElement.style.marginLeft = '10px';
        usuarioLogadoElement.style.color = 'white';
        shadowRoot.querySelector('.div__user-login').appendChild(usuarioLogadoElement);
        let divUserLogin = shadowRoot.querySelector('.div__user-login');
        let elInventarioBuscar = shadowRoot.querySelector('.a__inventario-buscar');
        let showLinkLoggedInOnly = shadowRoot.querySelector('.show_logged_in_only');
        let elBuscarChamado = shadowRoot.querySelector('.a__buscar-chamado');
        let elGerenciarEstoque = shadowRoot.querySelector('.a__gerenciar-estoque');
        this.load(usuarioLogadoElement, divUserLogin, elInventarioBuscar, showLinkLoggedInOnly, elBuscarChamado, elGerenciarEstoque);
    }

    load(usuarioLogadoElement, divUserLogin, elInventarioBuscar, showLinkLoggedInOnly, elBuscarChamado, elGerenciarEstoque) {
        let token = localStorage.getItem('access_token');
        let validToken;
        if (token != null) {
            validToken = checkTokenExpirationDate(token);
            if (validToken.auth) {
                usuarioLogadoElement.innerHTML = validToken.username;
                divUserLogin.classList.toggle("d-none", false);
                elInventarioBuscar.classList.toggle('d-none', false);
                showLinkLoggedInOnly.classList.toggle('d-none', false);
                elBuscarChamado.classList.toggle('d-none', false);
                elGerenciarEstoque.classList.toggle('d-none', false);
            } else {
                localStorage.removeItem('access_token');
            }
        }
    }
}

customElements.define('header-component', Header);

function checkTokenExpirationDate(token) {
    // console.log("checkToken");
    try {
        let s = token.split('.');
        var decodeString = atob(s[1]);
        const { exp, name } = JSON.parse(decodeString);
    
        if (new Date(exp * 1000) > new Date()) {
            return {
                auth: true,
                message: 'Valid signature',
                expira: new Date(exp * 1000),
                username: name
            };
        } else {
            return {
                auth: false,
                message: 'The token has expired'
            };
        }        
    } catch (error) {
        console.log("token inválido:", error)
        return {
            auth: false,
            message: 'invalid token'
        };
    }
}

function logout() {
    localStorage.removeItem('access_token');
    if (booleanPaginaEstoque) {
        window.location.href = '../../';
    } else {
        window.location.href = 'index';
    }    
}