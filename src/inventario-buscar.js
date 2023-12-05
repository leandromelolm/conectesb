// http://localhost:8888/inventario-buscar?search=all&id=2
// http://localhost:8888/inventario-buscar?id=2

window.addEventListener("DOMContentLoaded", () => {
    let p =  obterParametrosDaURL();
    if (p.search) {
        getApi();        
    }
    if (p.id) {
        getApiById(p.id);
    }
})

function handleSearch() {
    let searchId = document.getElementById('search-input').value;
    setarParametrosNaURL('','', searchId);
    getApiById(searchId);
}

function obterParametrosDaURL() {
    const url = new URL(window.location.href);
    const parametros = new URLSearchParams(url.search);
    const search = parametros.get('search');
    const protocolo = parametros.get('protocolo');
    const id = parametros.get('id');
    return { search, protocolo, id };
}

function setarParametrosNaURL(search, protocolo, id) {
    const url = new URL(window.location.href);
    const parametros = new URLSearchParams(url.search);
    if (search !== null && search !== undefined) {
      parametros.set('search', search);
    }
    if (protocolo !== null && protocolo !== undefined) {
      parametros.set('protocolo', protocolo);
    }
    if (id !== null && id !== undefined) {
      parametros.set('id', id);
    }
  
    window.history.replaceState({}, '', `${url.pathname}?${parametros}`);
  }

function getApi() {
    const param = obterParametrosDaURL();
    let api = "https://script.google.com/macros/s/AKfycbzz7_n2zVB7XlDmIATenuP5j89uqTPypFnJmfRRi0Dql2-tnWf53IFHoDINUdO2PQ3uqw/exec";
    apiParam = `${api}?search=${param.search}`
    fetch(apiParam,{ 
        method: "GET",
    })
    .then(response =>response.json())
    .then(data => divListGroup(data))
    .catch(error => console.log(error));
}

function getApiById(id) {
    // findById
    let api = 'https://script.google.com/macros/s/AKfycbyBWMDtbaUzoaWZ1tI7g70e5gNvDdsEIRhGu0fPDvMaW454TvUv8tCB626H5d9tTwm5Ag/exec';
    let apiParam = `${api}?id=${id}`
    fetch(apiParam,{ 
        method: "GET",
    })
    .then(response =>response.json())
    .then(data => getByIdResponse(data))
    .catch(error => console.log(error));
}

function divListGroup(res){
    // console.log(res);
    let listGroupItem = document.getElementById('listGroupItem');
    let item = [];
    res.content.data.forEach(e => {
        item.push(`
        <a href="#" class="list-group-item list-group-item-action">
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${e.unidade}</h5>
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

function getByIdResponse(res) {
    let itensInventario = JSON.parse(res.content.itensInventario);
    criarTabelaInventario(itensInventario);
    cabecalhoInventarioId(res.content);
    criarCardInformaçõesAdicionais(res.content.informacoesAdicionais);
}


function cabecalhoInventarioId(e) {
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

function copiarTodasInformacoesParaClipboard() {
    const div = document.getElementById('inventarioUnidade');
    // document.getElementById('divBtn').classList.add('hidden');
    const range = document.createRange();
    range.selectNode(div);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    try {
      document.execCommand('copy');
      alert('Informações copiada para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar tabela: ', error);
    }
    window.getSelection().removeAllRanges();
}

function copiarTabelaParaClipboard() {
    const tabela = document.getElementById('tabelaInventario');
    // document.getElementById('divBtn').classList.add('hidden');
    const range = document.createRange();
    range.selectNode(tabela);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    try {
      document.execCommand('copy');
      alert('Tabela copiada para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar tabela: ', error);
    }
    window.getSelection().removeAllRanges();
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

