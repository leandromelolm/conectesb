let res_AppScript;
let res_UrlSpreadSheet;
const apiUrlLastRow = 'https://script.google.com/macros/s/AKfycbyBBzepvuBTF414jIiZ6xbq89RFcYvW36yRR4yxarOsXoqFaLGvDRIf5FkSWCBNK3m5NQ/exec';
let ultimaAtualizacaoDaPagina = document.getElementById('ultimaAtualizacaoDaPagina');
let msgNovoPedido = document.getElementById('msgNovoPedido');
let abrirPedidonoFormulario = document.getElementById('abrirPedidonoFormulario');
let lastRowOrder;
let id = "";
let search = "";
let page = 1;
let perPage = 20;
let startId = 1; // startId e endId apenas são validos na pesquisa quando search for atribuido o valor 'pesquisarIntervalo'
let endId = 1;
let ultimoPedidoFeito;

window.onload = () => {
    showLoading();
    ultimoPedidoFeito = localStorage.getItem('ultimoPedido');
    
    fetch(apiUrlLastRow).then(response =>{
        return response.json();
    })
    .then(data => {
        
        if ( data.lastRow != ultimoPedidoFeito || ultimoPedidoFeito == null){
            localStorage.setItem('ultimoPedido', data.lastRow);
            fetch(`/.netlify/functions/api-spreadsheet?id=${id}&search=${search}&page=${page}&perPage=${perPage}&startId=${startId}&endId=${endId}`)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                localStorage.setItem('listaDePedidos',JSON.stringify(data.res.data));
                preencherTabelaListaDePedidos(data.res.data);
                ultimaAtualizacaoDaPagina.innerText = `última atualização: ${dateFormat(new Date())}`;                
            })
            .catch(function (error) {
                alert(error);
                console.log(error)
            });
        }else{
            console.log("Preenchido com dados do localStorage");
            let listaDePedidos = localStorage.getItem('listaDePedidos');
            preencherTabelaListaDePedidos(JSON.parse(listaDePedidos));
            ultimaAtualizacaoDaPagina.innerText = `última atualização: ${dateFormat(new Date())}`;
            msgNovoPedido.innerText = 'nenhum novo pedido';
        }
    })
    
    // POST
    submitPostTest("OI test");

};

function submitPostTest(str) {
    fetch('/.netlify/functions/api-spreadsheet', {
        method: 'post',
        body: JSON.stringify({
            str: str
        })
      }).then(function(response) {
        return response.json()
      }).then(function(data) {
        res_AppScript = data.appscript;
        res_UrlSpreadSheet = data.urlspreadsheet;
      })
};

function fetchGetSheetData(id, search, page, perPage, startId, endId){
    showLoading();
    let linkScript = res_AppScript;
    const linkPlanilha = res_UrlSpreadSheet;
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
        alert(`Erro na Requisição: ${error}`);
        document.getElementById('divListaPedido').innerHTML = "Pedido não encontrado. Insira um número de pedido válido.";
    });;    
};

function verificarDados(data){
    if (Array.isArray(data.res.results)) {
        const itens = data.res.results;
        preencherTabelaListaDePedidos(itens);
        hideLoading();
    } else {
        mostrarPedido(data.res);
        hideLoading();
    }

};

document.getElementById('search-form').addEventListener('submit', e => {
    e.preventDefault()
    pesquisar();   
});

function pesquisar(){
    let txtLinhaPesquisada = document.getElementById("textoPesquisado").value;
    if(!isNumberGreaterThanOne(txtLinhaPesquisada)){
        fetchGetSheetData("", txtLinhaPesquisada,"","","","");
    } else {
        fetchGetSheetData(txtLinhaPesquisada,"","","","","");
    }
    desabilitarBotaoPesquisa(); // desabilita por 3 segundos
};

function recuperarListaDePedidosLocalStorage() {
    let jsonListaDePedido = localStorage.getItem('listaDePedidos');
    let objListaDePedido = JSON.parse(jsonListaDePedido);
    return objListaDePedido;
};

function mostrarPedido(pedido) {
    abrirPedidonoFormulario.className = "btn btn-primary armazenamento";
    document.getElementById('divListaPedido').innerHTML = "";
    document.getElementById('divPedidoBuscado').className = 'card';
    document.getElementById('idPedido').innerHTML = `<b>Número Pedido</b>: ${pedido.id}`;
    document.getElementById('dataPedido').innerHTML = `<b>Data Pedido</b>: ${dateFormat(pedido.dataPedido)}`;
    document.getElementById('requisitante').innerHTML = `<b>Unidade Requisitante</b>: ${pedido.nomeUnidade}`;
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
};

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
            document.getElementById("textoPesquisado").value = link.textContent;
            pesquisar();
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
            document.getElementById("textoPesquisado").value = item.id;                    
            pesquisar();
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
    window.location.href = 'index.html';
};

function limparCampos() {
    document.getElementById('unidadeRequisitante').value = '';
    document.getElementById('listaPedido').value = '';
};

function limparTodosCampos(){
    limparCampos();
    document.getElementById('divListaPedido').innerHTML = "";
    document.getElementById("textoPesquisado").value = "";
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

let botaoHabilitado = true;
function desabilitarBotaoPesquisa() {
    if (botaoHabilitado) {
    botaoHabilitado = false;
    document.getElementById('btnPesquisa').disabled = true;
    setTimeout(function() {
        botaoHabilitado = true;
        document.getElementById('btnPesquisa').disabled = false;
    }, 3000);
    }
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
