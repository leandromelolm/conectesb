const headerTemplate = document.createElement('template');

headerTemplate.innerHTML = `
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
<style>
nav {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color:  #0051A2 !important;
}

a {
    font-size: x-small;
    font-weight: 700;
    margin: 0 10px;
    color: white !important;
    text-decoration: none;
}

a:hover {
    padding-bottom: 5px;
    box-shadow: inset 0 -2px 0 0 #fff;
}

.navbar-toggler-icon {
    filter: invert(1);
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
                <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div class="navbar-nav">
                        <a class="nav-link active" aria-current="page"  href="fazerpedido.html">Fazer Pedido</a>
                        <a class="nav-link active" href="pedidos.html">Buscar Pedido</a>
                        <a class="nav-link active" href="abrirchamado.html">Abrir Chamado</a>
                        <a class="nav-link active" href="buscarchamado.html">Buscar Chamado</a>
                        <a class="nav-link active" href="inventario-fazer.html"> Fazer Inventário</a>
                        <a class="nav-link active" href="inventario-buscar?search=all"> Buscar Inventário</a>
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

        if (isInLoginPage) {
            // Atualizar os links removendo "user/"
            const links = shadowRoot.querySelectorAll('a');
            links.forEach((link) => {
                link.href = link.href.replace("/user/", "/");
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
    }
}

customElements.define('header-component', Header);
