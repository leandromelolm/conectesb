let res_AppScript;
let res_UrlSpreadSheet;
const apiUrlLastRow = 'https://script.google.com/macros/s/AKfycbyBBzepvuBTF414jIiZ6xbq89RFcYvW36yRR4yxarOsXoqFaLGvDRIf5FkSWCBNK3m5NQ/exec';
let lastRowOrder;
window.onload = () => {    

    // GET
    let id = "";
    let search = "";
    let page = 1;
    let perPage = 20;
    let startId = 1; // startId e endId apenas são validos na pesquisa quando search for atribuido o valor 'pesquisarIntervalo'
    let endId = 1;
    fetch(`/.netlify/functions/fetch-spreadsheet?id=${id}&search=${search}&page=${page}&perPage=${perPage}&startId=${startId}&endId=${endId}`)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            preencherTabelaListaDePedidos(data.res.data);
        })
    
    // POST
    submitEmail("TEST@TEST.EMAIL");


    // fetch(apiUrlLastRow)
    //     .then(response =>{
    //     return response.json();
    //     })
    //     .then(data =>{
    //         dados = recuperarListaDePedidosLocalStorage();
    //         if (dados) {
    //             preencherTabelaListaDePedidos(dados);
    //             console.log(data.lastRow);
    //         }
    //         lastRowOrder = data.lastRow;
    //         // verificarDados(data.lastRow);
    //         console.log(data.lastRow);
    //         // fetchPostGetSheetData('ultimopedido', '');
    //         fetchPostGetSheetData('obter', `A${data.lastRow - 20}:C${data.lastRow}`);
    // })


    // fetch(`/.netlify/functions/fetch-spreadsheet`)
    //     .then(function (response) {
    //         return response.json();
    //     })
    //     .then(function (res) {                      
    //        resAppScript = res.appscript;
    //        restUrlSpreadSheet = res.urlspreadsheet;
    //        console.log(res.testenv);
    //        dados = recuperarListaDePedidosLocalStorage();
    //        if (dados) {
    //             preencherTabelaListaDePedidos(dados);
    //        }
    //        fetchPostGetSheetData('ultimopedido', '');
    //     })
    //     .catch(function (error) {
    //         alert(error);
    //         console.log(error)
    //     });
};

function submitEmail(email) {
    fetch('/.netlify/functions/fetch-spreadsheet', {
        method: 'post',
        body: JSON.stringify({
          email: email
        })
      }).then(function(response) {
        return response.json()
      }).then(function(data) {
        console.log('data from function (POST)', data)
        res_AppScript = data.appscript;
        res_UrlSpreadSheet = data.urlspreadsheet;
      })
  }

const formularioPequisa = document.getElementById('search-form');
formularioPequisa.addEventListener('submit', e => {
    e.preventDefault()
    pesquisar();   
})

let itemInicial;
let ultimoPedido;
function pesquisar(){
    let txtLinhaPesquisada = document.getElementById("textoPesquisado").value;
    let txtlinhaFormatada = `A${txtLinhaPesquisada}:F${txtLinhaPesquisada}`;
    if(!isNumberGreaterThanOne(txtLinhaPesquisada)){
        document.getElementById("textoPesquisado").value = "";
        return alert("Apenas é possível pesquisar pelo número do pedido");
    } else
    if(!txtLinhaPesquisada == ''){
        fetchPostGetSheetData('obter', txtlinhaFormatada);
    }
    else{
        fetchPostGetSheetData('ultimopedido', '');      
    }   
    desabilitarBotaoPesquisa(); // desabilita por 3 segundos
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
}

function fetchPostGetSheetData(tipoRequisicao, obterCelulas){
    showLoading();
    let linkScript = res_AppScript;
    const linkPlanilha = res_UrlSpreadSheet;
    fetch(linkScript, {
        method: 'POST',
        body: JSON.stringify({
          link: linkPlanilha,
          pagina: 'sheet1',
          celulas: obterCelulas,
          requisicao: tipoRequisicao,
          sheetName: 'Sheet1'
        }),    
    })
    .then((response) => response.json()) 
    .then((data) => verificarDados(data))
    .catch(function (error) {
        alert(`Erro na Requisição: ${error}`);
        document.getElementById('divListaPedido').innerHTML = "Pedido não encontrado. Insira um número de pedido válido.";
    });;    
};

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function verificarDados(dados){    
    let listPedidosRecebido;
    const ultPedido = localStorage.getItem('ultimoPedido', dados);
    if (ultPedido == dados) {      
        console.log("verificarDados1");  
        dados = recuperarListaDePedidosLocalStorage();
        ultimoPedido = ultPedido;
        document.querySelector('#numeroUltimoPedido').innerHTML = `Último pedido: ${ultPedido}`;
    }
    if (typeof dados === 'number') {       
        localStorage.setItem('ultimoPedido', dados);
        document.querySelector('#numeroUltimoPedido').innerHTML = `
        Parece ter um novo pedido.
        Último pedido: ${dados}`;
        ultimoPedido = dados;       
        if (dados < 22) {            
            itemInicial = ultimoPedido - dados;
            fetchPostGetSheetData('obter', `A${itemInicial + 2}:C${ultimoPedido}`);
        } else {           
            fetchPostGetSheetData('obter', `A${ultimoPedido - 20}:C${ultimoPedido}`);
        }
    }
    if (typeof dados !== 'number') {        
        hideLoading(); 
        listPedidosRecebido = dados;
        
        let abrirPedidonoFormulario = document.getElementById('abrirPedidonoFormulario');
        let divPedidoBuscado = document.getElementById('divPedidoBuscado');
        let listaOrdenadaItemPedido = document.getElementById('listaOrdenadaItemPedido');
        divPedidoBuscado.className = 'card';
        document.getElementById('divListaPedido').innerHTML = "";
        if(listPedidosRecebido.length > 1){
        // if(Array.isArray(listPedidosRecebido)){
            preencherTabelaListaDePedidos(listPedidosRecebido);
            abrirPedidonoFormulario.className = "d-none";
            localStorage.setItem('listaDePedidos', JSON.stringify(listPedidosRecebido))
        }
        if(listPedidosRecebido[0][0] == ''){
            document.getElementById('divListaPedido').innerHTML = "Pedido não encontrado";
            divPedidoBuscado.className = 'd-none';
            abrirPedidonoFormulario.className = "d-none";
            listaOrdenadaItemPedido.innerHTML = '';
        }
        if (listPedidosRecebido.length == 1 && listPedidosRecebido[0][0] !== '') {
            abrirPedidonoFormulario.className = "btn btn-primary armazenamento";            
            preencherTabelaPedidoBuscado(listPedidosRecebido);
        }
    };
}

function recuperarListaDePedidosLocalStorage() {
    let jsonListaDePedido = localStorage.getItem('listaDePedidos');
    let objListaDePedido = JSON.parse(jsonListaDePedido);
    return objListaDePedido;
}

function preencherTabelaPedidoBuscado(data) {    
    const tabela = document.getElementById("data-table").getElementsByTagName('tbody')[0];
    while (tabela.firstChild) {
        tabela.removeChild(tabela.firstChild);
    }
    document.getElementById('idPedido').innerHTML = `<b>Número Pedido</b>: ${data[0][0]}`;
    document.getElementById('dataPedido').innerHTML = `<b>Data Pedido</b>: ${dateFormat(data[0][1])}`;
    document.getElementById('requisitante').innerHTML = `<b>Unidade Requisitante</b>: ${data[0][2]}`;
    document.getElementById('unidadeRequisitante').value = data[0][3];
    document.getElementById('listaPedido').value = data[0][4];   
    const listaItens = data[0][4];    
    let dados = JSON.parse(listaItens);
    dados.forEach((obj, index) => {
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
}

function preencherTabelaListaDePedidos(arr) {    
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
    // const tipoPedidoHeader = document.createElement('th');
    // tipoPedidoHeader.textContent = 'Tipo';

    theadRow.appendChild(ordemHeader);
    theadRow.appendChild(dataHeader);
    theadRow.appendChild(unidadeHeader);
    thead.appendChild(theadRow);
    table.appendChild(thead);    

    arr.forEach((item) => {
        const row = table.insertRow();
        const cell = row.insertCell();
        console.log(item);
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
            document.getElementById("textoPesquisado").value = item[0];                    
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
}

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
    fetchPostGetSheetData('ultimopedido', '');
    
};

function dateFormat(data) {
    const dataObj = new Date(data);
    
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    const horas = String(dataObj.getHours()).padStart(2, '0');
    const minutos = String(dataObj.getMinutes()).padStart(2, '0');
    const segundos = String(dataObj.getSeconds()).padStart(2, '0');
    
    return `${dia}-${mes}-${ano} ${horas}:${minutos}:${segundos}`;
}

function showLoading() {
    document.getElementById("loading-message").style.display = "block";
    document.getElementById("content").style.display = "none";
}

// Função para ocultar a mensagem de "Carregando" e mostrar o conteúdo
function hideLoading() {
    document.getElementById("loading-message").style.display = "none";
    document.getElementById("content").style.display = "block";
}

function fetchGetLastRow() {    
}