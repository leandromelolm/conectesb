let ultimoSalvo;
window.addEventListener("DOMContentLoaded", () => {
    let ls =localStorage.getItem('inventario-lista_enviados');
    if (ls) {
        divListGroup(JSON.parse(ls));
    }    
    getApiLastRow();
    // getApi();
    let p =  obterParametrosDaURL();
    if (p.protocolo) {
        getApiByProtocolo(p.protocolo);
    }
})

function obterParametrosDaURL() {
    const url = new URL(window.location.href);
    const parametros = new URLSearchParams(url.search);
    const search = parametros.get('search');
    const protocolo = parametros.get('protocolo');
    return { search, protocolo };
}

function setarParametrosNaURL(search, protocolo) {
    const url = new URL(window.location.href);
    const parametros = new URLSearchParams(url.search);
    if (search !== null && search !== undefined) {
      parametros.set('search', search);
    }
    if (protocolo !== null && protocolo !== undefined) {
      parametros.set('protocolo', protocolo);
    }  
    window.history.replaceState({}, '', `${url.pathname}?${parametros}`);
  }

async function getApiLastRow() {
    document.getElementById('divLoadingUpdatePage').classList.remove('d-none');
    const response = await fetch('https://script.google.com/macros/s/AKfycbwFSFG79Sgu1P4HIO9kZ4huVb2FZOb38hvbsLhyJmrgPE7Pxx6GUERGCqphDcMRnnTqaA/exec', {
        method: "GET"
    });
    if (!response.ok) {
    throw new Error('Erro na requisição: ' + response.status);
    }  
    const data = await response.json();
    let lastRow = data.content;
    if (lastRow > localStorage.getItem('inventario-lista-ultLinha')) {
        document.getElementById('divLoadingUpdatePage').classList.remove('d-none');
        getApi();
        localStorage.setItem('inventario-lista-ultLinha', data.content);
    } else {
        document.getElementById('divLoadingUpdatePage').classList.add('d-none');
        let ls =localStorage.getItem('inventario-lista_enviados');
        divListGroup(JSON.parse(ls));
    }
}

function getApi(){
    console.log('getApi');
    const param = obterParametrosDaURL();
    let api = "https://script.google.com/macros/s/AKfycbwFSFG79Sgu1P4HIO9kZ4huVb2FZOb38hvbsLhyJmrgPE7Pxx6GUERGCqphDcMRnnTqaA/exec"
    apiParam = `${api}?search=${param.search}`
    fetch(apiParam,{ 
        method: "GET",
    })
    .then(response =>response.json())
    .then(data => responseGetApi(data))
    .catch(error => msgErroGetApi(error));
}

function msgErroGetApi(error) {
    document.getElementById('divLoadingUpdatePage').classList.add('d-none');
    console.log(error);
    alert(error);
}

function responseGetApi(data) {
    document.getElementById('divLoadingUpdatePage').classList.add('d-none');
    divListGroup(data);
    salvarLocalStorageLista(data);    
}

function salvarLocalStorageLista(data) {
    if (data.totalRows !== localStorage.getItem('inventario-lista-ultLinha')) {
        localStorage.setItem('inventario-lista_enviados', JSON.stringify(data));
    } 
}

function divListGroup(res){
    // console.log(res);
    let listGroupItem = document.getElementById('listGroupItem');
    let item = [];
    res.content.data.forEach(e => {
        item.push(`
        <div class="div__card-item">
            <a href="#divSearch" class="a__item">
                <div class="div__unidade-id d-flex w-100 justify-content-between">
                    <strong class="strong__und">${e.unidade}</strong>
                    <small class="text-muted">${e.id}</small>
                </div>
                <p class="mb-1 text-muted">${e.data}</p>
                <small class="text-muted">${e.funcionario}</small>
            </a>
        </div>        
        `)
    });
    listGroupItem.innerHTML = item.join('');
    document.getElementById('itemLoading').style.display = 'none';
}

function eventClickEnter(event) {
    if (event.keyCode === 13) {
        handleSearch();
    }
}

function handleSearch() {
    let protocolo = document.getElementById('input-search').value;
    setarParametrosNaURL('all',protocolo);
    document.getElementById('divBtn').classList.add('d-none');
    if(verificarInput(protocolo))
        getApiByProtocolo(protocolo);    
}

function verificarInput(protocolo){
    if(!protocolo){
        document.querySelector("#messageSearch").innerHTML = `Insira o protocolo no campo "Ver detalhes do inventário".`;
        document.querySelector("#inventarioUnidade").innerHTML = `
        <div id="headerInventary"></div>
            <table id="tabelaInventario"></table>
        <div id="informacoesAdicionais"></div>
        `;
        return false;
    }
    if(protocolo.length < 10 || protocolo.length >20){
        document.querySelector("#messageSearch").innerHTML = `Protocolo inválido.`;
        document.querySelector("#inventarioUnidade").innerHTML = `
        <div id="headerInventary"></div>
            <table id="tabelaInventario"></table>
        <div id="informacoesAdicionais"></div>
        `;
        return false;

    }
    return true;
}

function getApiByProtocolo(protocolo) {
    document.getElementById('divLoadingById').classList.remove('d-none');
    document.querySelector("#messageSearch").innerHTML = ``;
    // const param = obterParametrosDaURL();
    let api = "https://script.google.com/macros/s/AKfycbwFSFG79Sgu1P4HIO9kZ4huVb2FZOb38hvbsLhyJmrgPE7Pxx6GUERGCqphDcMRnnTqaA/exec";
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
    document.querySelector("#messageSearch").innerHTML = `
        <span>Erro ao buscar. Protocolo pesquisado talvez não exista.</span>
    `;
    document.querySelector("#inventarioUnidade").innerHTML = `
        <div id="headerInventary"></div>
            <table id="tabelaInventario"></table>
        <div id="informacoesAdicionais"></div>
    `;
}

function getByProtocoloResponse(res) {
    document.getElementById('itemLoading').style.display = 'none';   
    document.getElementById('divLoadingById').classList.add('d-none')
    if(res.content === null)
        return msgErro("requisição retornou nulo");
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
                <strong class="mb-1">
                    <b>${e.unidade}</b>
                </strong>
                <small class="text-muted">${e.id}</small>
            </div>
            <p class="mb-1">${dataFormatada}</p>
            <small class="text-muted">${e.responsavel}</small>
        </span>       
        `     
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
    document.getElementById('divBtn').classList.remove('d-none');
}

function atualizarPagina() {
    document.getElementById('divLoadingUpdatePage').classList.remove('d-none');
    getApi();
}

function copiarTodasInformacoesParaClipboard() {
    const div = document.getElementById('inventarioUnidade');
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
