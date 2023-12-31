let ultimaAtualizacaoDaPagina = document.getElementById('ultimaAtualizacaoDaPagina');
let msgNovoPedido = document.getElementById('msgNovoPedido');
let abrirPedidonoFormulario = document.getElementById('abrirPedidonoFormulario');
let id = "";
let search = "";
let page = 1;
let perPage = 20;
let startId = 1; // startId e endId apenas são validos na pesquisa quando search for atribuido o valor 'pesquisarIntervalo'
let endId = 1;
let ultimoPedidoFeito;

window.onload = async () => {
    showLoading();
    ultimoPedidoFeito = localStorage.getItem('ultimoPedido');
    let listaDePedidos = localStorage.getItem('listaDePedidos');
    if(listaDePedidos){
        preencherTabelaListaDePedidos(JSON.parse(listaDePedidos));
    }    
    // methodFetch(listaDePedidos); // fetch lastRow feito direto a api_google_script    
    const responseLastRow = await fetch('/.netlify/functions/api-spreadsheet?lastRow=true')
    .then(res => res.json());
    methodFetchFunctionNetlify(responseLastRow.res.body.lastRow,listaDePedidos);
};

function fetchGetSheetData(id, search, page, perPage, startId, endId){
    showLoading();
    fetch(
        `/.netlify/functions/api-spreadsheet?id=${id}&search=${search}&page=${page}&perPage=${perPage}&startId=${startId}&endId=${endId}`
    )
    .then( data => {
        return data.json();
    })
    .then( response =>{
        verificarDados(response);
    })
    .catch(function (error) {
        hideLoading();
        alert(`Erro na Requisição: ${error}`);
        document.getElementById('response__erro').innerHTML = "Pesquisa não encontrada. Insira um número de pedido válido.";
        console.log("erro: ",error);
    });;    
};

function verificarDados(data){
    if (data.responseDataPedidos.result === "error") {        
        hideLoading();
        return document.getElementById('response__erro').innerHTML = data.responseDataPedidos.error.message;
    }

    if (Array.isArray(data.responseDataPedidos.results)) {
        const itens = data.responseDataPedidos.results;
        preencherTabelaListaDePedidos(itens);
        hideLoading();
    } else {
        mostrarPedido(data.responseDataPedidos);
        hideLoading();
    }
};

function eventClickEnter(event) {
    if (event.keyCode === 13) {
        handleSearch();
    }
}

function handleSearch() {
    var txtSearch = document.getElementById('search-input').value;
    searchTxt(txtSearch);
    desabilitarBotaoPesquisa();
};

function searchTxt(txtSearch){
    document.getElementById('response__erro').innerHTML = '';
    if (!txtSearch) {
        return preencherTabelaListaDePedidos(
            JSON.parse(localStorage.getItem('listaDePedidos'))
        );
    }    
    if (isPositiveInteger(txtSearch)) { 
        fetchGetSheetData(txtSearch,"","","","","");
    }
    if(Math.sign(txtSearch) == -1 || Math.sign(txtSearch) == 0) {
        return document.getElementById('response__erro').innerHTML = 'Numero de pedido inválido';

    }
    if (!isPositiveInteger(txtSearch)){
        return fetchGetSheetData("", txtSearch,"","","","");
    }
    desabilitarBotaoPesquisa(); // desabilita por 3 seg
};

function isPositiveInteger(n) {
    return /^\d+$/.test(n) && parseInt(n, 10) > 0;
}

function preencherTabelaListaDePedidos(arr) {
    hideLoading();
    abrirPedidonoFormulario.className = "d-none";
    document.getElementById('divPedidoBuscado').className = 'd-none';
    document.getElementById('divListaPedido').innerHTML = "";
    const tabelaDiv = document.getElementById('divListaPedido');
    const table = document.createElement('table');
    table.className = 'table';
    const thead = document.createElement('thead');
    const theadRow = document.createElement('tr');
    const ordemHeader = document.createElement('th');
    ordemHeader.textContent = '#ID';
    const dataHeader = document.createElement('th');
    dataHeader.textContent = 'Data';
    const unidadeHeader = document.createElement('th');
    unidadeHeader.textContent = 'Unidade';

    theadRow.appendChild(ordemHeader);
    theadRow.appendChild(dataHeader);
    theadRow.appendChild(unidadeHeader);
    thead.appendChild(theadRow);
    table.appendChild(thead);    

    arr.forEach((item) => {
        const row = table.insertRow();
        const cell = row.insertCell();
        const link = document.createElement('a');
        link.textContent = item.id; 
        link.href = 'javascript:void(0)';
        link.style.textDecoration = 'none';
        link.style.fontSize = '16px';

        link.addEventListener('click', function () {
            document.getElementById("search-input").value = link.textContent;
            searchTxt(link.textContent);
            scrollToTop();
        });
        cell.appendChild(link);

        const cell2 = row.insertCell();
        cell2.textContent = dateFormat(item.dataPedido);

        const cell3 = row.insertCell();
        const linkUnid = document.createElement('a');
        linkUnid.textContent = item.nomeUnidade; 
        linkUnid.href = 'javascript:void(0)';
        linkUnid.style.textDecoration = 'none';
        linkUnid.style.fontSize = '15px';

        linkUnid.addEventListener('click', function () {
            document.getElementById("search-input").value = item.id;                    
            searchTxt(item.id);
            scrollToTop();
        });
        cell3.appendChild(linkUnid);

        linkUnid.addEventListener('mouseenter', function () {
            linkUnid.style.color = 'blue';                    
        });           
        linkUnid.addEventListener('mousedown', function () {
            linkUnid.style.color = 'gray'; 
            
        });
        linkUnid.addEventListener('mouseleave', function () {
            linkUnid.style.color = ''; 
            linkUnid.style.backgroundColor = '';                    
        });
    }); 
    tabelaDiv.appendChild(table);
};

function mostrarPedido(pedido) {
    abrirPedidonoFormulario.className = "btn btn-primary armazenamento";
    document.getElementById('divPedidoBuscado').className = 'card';
    document.getElementById('labelPedido').innerHTML = `<b>Número Pedido</b>: ${pedido.id}`;
    // document.getElementById('idPedido').innerHTML = `<b>Número Pedido</b>: ${pedido.id}`;
    document.getElementById('dataPedido').innerHTML = `<b>Data Pedido</b>: ${dateFormat(pedido.dataPedido)}`;
    document.getElementById('requisitante').innerHTML = `<b>Unidade Requisitante</b>: ${pedido.nomeUnidade}`;
    document.getElementById('unidadeRequisitante').value = pedido.requisitanteStr;
    document.getElementById('listaPedido').value = pedido.itensStr; 
    const tabela = document.getElementById("data-table").getElementsByTagName('tbody')[0];
    while (tabela.firstChild) {
        tabela.removeChild(tabela.firstChild);
    }
    const listaItens =pedido.itens; 
    listaItens.forEach((obj, index) => {
        const row = tabela.insertRow();        
        const itemCell = row.insertCell();
        itemCell.textContent = index + 1; // Números crescentes a partir de 1      
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const cell = row.insertCell();
            cell.textContent = obj[key];
          }
        }
    });
    // let modalMostrarPedido = new bootstrap.Modal(document.getElementById('modalMostrarPedido'), {});
    // modalMostrarPedido.toggle();
    openModal();
};


function openModal() {
    $('#modalMostrarPedido').modal('show');
}

function closeModal() {
    $('#modalMostrarPedido').modal('hide');
}

const closeButton = document.querySelector(".btn-secondary[data-dismiss='modal']");
closeButton.addEventListener("click", function() {
    closeModal();
});


function scrollToTop() {
    window.scrollTo({
        top:0,
        behavior: 'smooth'
    })
};

function abrirPedidoNoFormulario() {
    const unidadeRequisitante = document.getElementById('unidadeRequisitante').value  
    const itensDados = document.getElementById('listaPedido').value;
    localStorage.setItem('dadosRequerente', unidadeRequisitante)
    localStorage.setItem('dadosItens', itensDados);
    // window.open('index.html', '_blank');
    window.location.href = 'fazerpedido.html';
};

function limparCampos() {
    document.getElementById('unidadeRequisitante').value = '';
    document.getElementById('listaPedido').value = '';
};

function limparTodosCampos(){
    limparCampos();
    document.getElementById('divListaPedido').innerHTML = "";
    document.getElementById("search-input").value = "";
    divPedidoBuscado = document.getElementById('divPedidoBuscado');
    divPedidoBuscado.className = 'd-none table';
    let listaDePedidos = localStorage.getItem('listaDePedidos');
    preencherTabelaListaDePedidos(JSON.parse(listaDePedidos));
    
};

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


function desabilitarBotaoPesquisa() {
    document.getElementById('btn-search').disabled = true;
    setTimeout(function() {
        document.getElementById('btn-search').disabled = false;
    }, 3000);
};

function showLoading() {
    document.getElementById("loading-message").style.display = "block";
    document.getElementById("content").style.display = "none";
};

function hideLoading() {
    document.getElementById("loading-message").style.display = "none";
    document.getElementById("content").style.display = "block";
};

function isNumberGreaterThanOne(value) {
    if (!(!isNaN(value) && !isNaN(parseFloat(value))) || parseFloat(value) <= 1) {
      const message = "Faça a pesquisa pelo número de pedido (#ID).";
      const alertElement = document.getElementById("alert-message");      
      if (alertElement) {
        alertElement.textContent = message;
      }  
      return false;
    } 
    document.getElementById("alert-message").innerHTML = "";    
    return true;
};

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

// Chamada get direta
function methodFetch(listaDePedidos) {
    const API_LAST_ROW = 'API_GOOGLE_SCRIPT_LASTROW';
    fetch(API_LAST_ROW).then(response =>{
        return response.json();
    })
    .then(data => {        
        if ( data.lastRow != ultimoPedidoFeito || ultimoPedidoFeito == null || listaDePedidos == null){
            localStorage.setItem('ultimoPedido', data.lastRow);
            fetch(`/.netlify/functions/api-spreadsheet?id=${id}&search=${search}&page=${page}&perPage=${perPage}&startId=${startId}&endId=${endId}`)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                localStorage.setItem('listaDePedidos',JSON.stringify(data.responseDataPedidos.data));
                preencherTabelaListaDePedidos(data.responseDataPedidos.data);
                const dtUltPedido = dateFormat(data.responseDataPedidos.data[0].dataPedido);
                console.log(dtUltPedido);
                const dataUltimoPedido = dtUltPedido.split(' ')
                msgNovoPedido.innerText = `Data do último pedido: ${dataUltimoPedido[0]}`;
            })
            .catch(function (error) {
                alert(error);
                console.log(error)
            });
        } 
        ultimaAtualizacaoDaPagina.innerText = `Última atualização: ${dateFormat(new Date())}`;
    })
}

function methodFetchFunctionNetlify(ultimoPedido, listaDePedidos) {
    if ( ultimoPedido != ultimoPedidoFeito || ultimoPedidoFeito == null || listaDePedidos == null){
        localStorage.setItem('ultimoPedido', ultimoPedido);
        showLoading();
        fetch(`/.netlify/functions/api-spreadsheet?id=${id}&search=${search}&page=${page}&perPage=${perPage}&startId=${startId}&endId=${endId}`)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            localStorage.setItem('listaDePedidos',JSON.stringify(data.responseDataPedidos.data));
            preencherTabelaListaDePedidos(data.responseDataPedidos.data);
            const dtUltPedido = dateFormat(data.responseDataPedidos.data[0].dataPedido);
            const dataUltimoPedido = dtUltPedido.split(' ')
            msgNovoPedido.innerText = `Data do último pedido: ${dataUltimoPedido[0]}`;
            document.getElementById('btnAtualizarPagina').classList.toggle('d-none', false);
            document.getElementById('msgAguarde').classList.toggle('d-none', true);
            hideLoading();
        })
        .catch(function (error) {
            document.getElementById('btnAtualizarPagina').classList.toggle('d-none', false);
            document.getElementById('msgAguarde').classList.toggle('d-none', true);
            hideLoading();
            alert(error);
            console.log(error)
        });
    }
    ultimaAtualizacaoDaPagina.innerText = `Última atualização: ${dateFormat(new Date())}`;
}

function atualizarPagina() {
    // Valores setados para forçar a requisição
    let ultimoPedido = 1; 
    let listaDePedidos = null;
    document.getElementById('btnAtualizarPagina').classList.toggle('d-none', true);
    document.getElementById('msgAguarde').classList.toggle('d-none', false);
    methodFetchFunctionNetlify(ultimoPedido, listaDePedidos);
}