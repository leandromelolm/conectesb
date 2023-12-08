
window.addEventListener("DOMContentLoaded", () => {
    getApi();
})

function obterParametrosDaURL() {
    const url = new URL(window.location.href);
    const parametros = new URLSearchParams(url.search);
    const search = parametros.get('search');
    const protocolo = parametros.get('protocolo');
    return { search, protocolo };
}

function getApi(){
    const param = obterParametrosDaURL();
    let api = "https://script.google.com/macros/s/AKfycbzz7_n2zVB7XlDmIATenuP5j89uqTPypFnJmfRRi0Dql2-tnWf53IFHoDINUdO2PQ3uqw/exec"
    apiParam = `${api}?search=${param.search}`
    fetch(apiParam,{ 
        method: "GET",
    })
    .then(response =>response.json())
    .then(data => divListGroup(data))
    .catch(error => console.log(error));
}

function divListGroup(res){
    // console.log(res);
    let listGroupItem = document.getElementById('listGroupItem');
    let item = [];
    res.content.data.forEach(e => {
        item.push(`
        <a href="#divSearch" class="list-group-item list-group-item-action">
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${e.unidade}</h5>
                <small class="text-muted">${e.id}</small>
            </div>
            <p class="mb-1">${e.data}</p>
            <small class="text-muted">${e.funcionario}</small>
        </a>        
        `)        
    });
    listGroupItem.innerHTML = item.join('');
    document.getElementById('itemLoading').style.display = 'none';
    // localStorage.setItem('inventario-lista_enviados', JSON.stringify(res.content.data));
    // localStorage.setItem('inventario-lista_enviados_tamanho', res.content.data.length);
}

function eventClickEnter(event) {
    if (event.keyCode === 13) {
        handleSearch();
    }
}

function handleSearch() {
    let protocolo = document.getElementById('search-input').value;
    getApiByProtocolo(protocolo);
}

function getApiByProtocolo(protocolo) {
    document.getElementById('divLoadingById').classList.remove('d-none');
    let api = "https://script.google.com/macros/s/AKfycbyBWMDtbaUzoaWZ1tI7g70e5gNvDdsEIRhGu0fPDvMaW454TvUv8tCB626H5d9tTwm5Ag/exec";
    apiParam = `${api}?protocolo=${protocolo}`
    fetch(apiParam,{ 
        method: "GET",
    })
    .then(response =>response.json())
    .then(data => getByProtocoloResponse(data))
    .catch(error => msgErro(error));
}

function msgErro(error) {
    console.log(error);
    alert(`
    Erro ao buscar. Protocolo pesquisado talvez não exista.
    `)
}

function getByProtocoloResponse(res) {
    document.getElementById('divLoadingById').classList.add('d-none')
    let itensInventario = JSON.parse(res.content.itensInventario);
    criarTabelaInventario(itensInventario);
    cabecalhoInventario(res.content);
    criarCardInformaçõesAdicionais(res.content.informacoesAdicionais);
}

function cabecalhoInventario(e) {
    let headerInventary = document.getElementById('headerInventary');
    let dataFormatada = dateFormat(e.data);
    headerInventary.innerHTML = `
        <span href="#" class="list-group-item list-group-item-action span__header-inventary">
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">
                    <b>${e.unidade}</b>
                </h5>
                <small class="text-muted">${e.id}</small>
            </div>
            <p class="mb-1">${dataFormatada}</p>
            <small class="text-muted">${e.responsavel}</small>
        </span>       
        `
    document.getElementById('itemLoading').style.display = 'none';    
}

function criarTabelaInventario(itensInventario) {
    const tabelaInventario = document.getElementById('tabelaInventario');
    tabelaInventario.innerHTML = '';
    const cabecalho = tabelaInventario.createTHead();
    const cabecalhoLinha = cabecalho.insertRow();
    const rotulos = ['Item', 'Descrição', 'Estoque', 'Pedido'];
    rotulos.forEach((rotulo) => {
        const th = document.createElement('th');
        th.textContent = rotulo;
        cabecalhoLinha.appendChild(th);
    });
    itensInventario.forEach((item) => {
        const linha = tabelaInventario.insertRow();
        for (const chave in item) {
            const celula = linha.insertCell();
            celula.textContent = item[chave];
        }
    });
}

function criarCardInformaçõesAdicionais(e){
    const strQuebraLinha = e.replace(/\n/g, '<br>');
    let informacoesAdicionais = document.getElementById('informacoesAdicionais');
    informacoesAdicionais.innerHTML = `
        <span class="list-group-item list-group-item-action span__info-add">
            <div class="d-flex w-100 justify-content-between">
                <span class="mb-1">
                    <b>Informações adicionais:</b>
                </span>
            </div>
            <p class="mb-1">${strQuebraLinha}</p>
        </span>       
        `
}

function dateFormat(data) {   
    const dataObj = new Date(data);
    if (dataObj.toString() == "Invalid Date"){
        return `Não foi possível verificar a data`;
    }    
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    const horas = String(dataObj.getHours()).padStart(2, '0');
    const minutos = String(dataObj.getMinutes()).padStart(2, '0');
    const segundos = String(dataObj.getSeconds()).padStart(2, '0');
    
    return `${dia}-${mes}-${ano} ${horas}:${minutos}:${segundos}`;
};
