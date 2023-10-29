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
    let txtlinhaFormatada = `B${txtLinhaPesquisada}:F${txtLinhaPesquisada}`;
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
        alert(error);
        document.getElementById('divListaPedido').innerHTML = "Pedido não encontrado. Insira apenas o número do pedido";
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
        if (dados < 21) {
            itemInicial = ultimoPedido - dados;
            getSheetData('obter', `B${itemInicial + 1}:C${ultimoPedido}`);
        } else {
            getSheetData('obter', `B${ultimoPedido - 20}:C${ultimoPedido}`);
        }
    }
    if (typeof dados !== 'number') {
        hideLoading(); 

        listPedidosRecebido = dados;
        
        let abrirPedidonoFormulario = document.getElementById('abrirPedidonoFormulario');
        let tabelaPedidoBuscado = document.getElementById('tabelaPedidoBuscado');
        let listaOrdenadaItemPedido = document.getElementById('listaOrdenadaItemPedido');
        tabelaPedidoBuscado.className = 'd-inline table';
        document.getElementById('divListaPedido').innerHTML = "";
        if(listPedidosRecebido.length > 1){
            preencherTabelaListaDePedidos(listPedidosRecebido);
            abrirPedidonoFormulario.className = "d-none";
            localStorage.setItem('listaDePedidos', JSON.stringify(listPedidosRecebido))
        }
        if(listPedidosRecebido[0][0] == ''){
            document.getElementById('divListaPedido').innerHTML = "Pedido não encontrado";
            tabelaPedidoBuscado.className = 'd-none';
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
    document.getElementById('dataPedido').innerHTML = dateFormat(data[0][0]);
    document.getElementById('requisitante').innerHTML = data[0][1];
    document.getElementById('dadosRequisitante').innerHTML = data[0][2];
    const listaItens = data[0][3];
    document.getElementById('listaOrdenadaItemPedido').innerHTML = ''

    if(listaItens){
        let listObj = JSON.parse(listaItens);        
        const lista = document.getElementById("listaOrdenadaItemPedido");
        for (let i = 0; i < listObj.length; i++) {
            const item = document.createElement("li");
            item.textContent = `${listObj[i].especificacao}: ${listObj[i].quantidade}`;               
            lista.appendChild(item);
        }
    }
    document.getElementById('unidadeRequisitante').value = data[0][2];
    document.getElementById('listaPedido').value = data[0][3];
}

function preencherTabelaListaDePedidos(arr) {
    let ordem;
    if (ultimoPedido <21) {
        ordem = itemInicial+1;        
    } else {
        ordem = ultimoPedido - 20;
    }
    document.getElementById('tabelaPedidoBuscado').className = 'd-none';
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

    for (let i = 0; i < arr.length; i++) {
      const row = document.createElement('tr');
      const numeroCelula = document.createElement('td');
    //   numeroCelula.textContent = `${ordem}`;
      const link = document.createElement('a');
      link.textContent = ordem; 
      link.href = 'javascript:void(0)';
      link.style.textDecoration = 'none';
      link.style.fontSize = '20px';

      link.addEventListener('click', function () {
        document.getElementById("textoPesquisado").value = link.textContent;
        pesquisar();
      });

      numeroCelula.appendChild(link);    
      ordem++

      row.appendChild(numeroCelula);
      for (let j = 0; j < arr[i].length; j++) {
        const cell = document.createElement('td');
        if (arr[i][j].substr(0,2) == '20') {            
            cell.appendChild(document.createTextNode(dateFormat(arr[i][j])));           
        } else {
            cell.appendChild(document.createTextNode(arr[i][j]));
        }
        row.appendChild(cell);
      }  
      table.appendChild(row);
    }  
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
    tabelaPedidoBuscado = document.getElementById('tabelaPedidoBuscado');
    tabelaPedidoBuscado.className = 'd-none table';
    document.getElementById('listaOrdenadaItemPedido').innerHTML = '';
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