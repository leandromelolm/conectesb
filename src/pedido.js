let resAppScript;
let restUrlSpreadSheet;
window.onload = () => {
    fetch(`/.netlify/functions/fetch-spreadsheet`)
        .then(function (response) {
            return response.json();
        })
        .then(function (res) {                      
           resAppScript = res.appscript;
           restUrlSpreadSheet = res.urlspreadsheet;
           console.log(res.testenv);
           getSheetData('ultimopedido', '');
        })
        .catch(function (error) {
            alert(error);
            console.log(error)
        });
};

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
        getSheetData('obter', txtlinhaFormatada);
    }
    else{
        getSheetData('ultimopedido', '');      
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

function getSheetData(tipoRequisicao, obterCelulas){
    showLoading();
    let v16 = '';
    let v33 =  '';
    let linkScript = resAppScript;
    const linkPlanilha = restUrlSpreadSheet;
    fetch(linkScript, {
        method: 'POST',
        body: JSON.stringify({
          link: linkPlanilha,
          pagina: 'sheet1',
          celulas: obterCelulas,
          requisicao: tipoRequisicao,
        }),    
    })
    .then((response) => response.json()) 
    .then((data) => verificarDados(data))
    .catch(function (error) {
        alert(`Erro na Requisição: ${error}`);
        document.getElementById('divListaPedido').innerHTML = "Pedido não encontrado. Insira um número de pedido válido.";
    });;    
};

function verificarDados(dados){
    let listPedidosRecebido;
    const ultPedido = localStorage.getItem('ultimoPedido', dados);
    if (ultPedido == dados) {        
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
            getSheetData('obter', `A${itemInicial + 2}:C${ultimoPedido}`);
        } else {
            getSheetData('obter', `A${ultimoPedido - 20}:C${ultimoPedido}`);
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
        item.forEach((value, index) => {     
            const cell = row.insertCell();
            if (index === 0) {                
                const link = document.createElement('a');
                link.textContent = value; 
                link.href = 'javascript:void(0)';
                link.style.textDecoration = 'none';
                link.style.fontSize = '20px';

                link.addEventListener('click', function () {
                    document.getElementById("textoPesquisado").value = link.textContent;
                    pesquisar();
                });
                cell.appendChild(link); 
            }
            if (index === 1) {
                cell.textContent = dateFormat(value);
            } 
            if (index === 2) {
                const link = document.createElement('a');
                link.textContent = value; 
                link.href = 'javascript:void(0)';
                link.style.textDecoration = 'none';
                link.style.fontSize = '20px';

                link.addEventListener('click', function () {
                    document.getElementById("textoPesquisado").value = item[0];                    
                    pesquisar();
                });
                cell.appendChild(link);
            }
            // if (index === 5) {
            //     cell.textContent = value;
            // }
        });
    }); 
    tabelaDiv.appendChild(table);
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
    getSheetData('ultimopedido', '');
    
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