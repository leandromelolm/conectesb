window.onload = () => { 
    getSheetData('ultimopedido', '');
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
    let txtlinhaFormatada = `A${txtLinhaPesquisada}:E${txtLinhaPesquisada}`;
    if(!txtLinhaPesquisada == ''){
        getSheetData('obter', txtlinhaFormatada);
    }
    else{
        getSheetData('ultimopedido', '');      
    }   
    desabilitarBotaoPesquisa(); // desabilita por 3 segundos
};

function getSheetData(tipoRequisicao, obterCelulas){
    showLoading();
    const linkScriptv16 = 'https://script.google.com/macros/s/AKfycbyTH5vqL7NNn0qYTr6gIu-OshjKhMZGDMewxK16ITQTshDuy1QebjhHRFgvQA9Dol6hGw/exec';
    const linkPlanilha = 'https://docs.google.com/spreadsheets/d/1ZPSsgOIJJE0p-QT4r2pwVmf4zMtUE5x4FnwnTTig4W0/edit#gid=0'
    fetch(linkScriptv16, {
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
    if (typeof dados === 'number') {
        document.querySelector('#numeroUltimoPedido').innerHTML = `Ultimo pedido: ${dados}`;
        ultimoPedido = dados;       
        if (dados < 21) {
            itemInicial = ultimoPedido - dados;
            getSheetData('obter', `A${itemInicial + 1}:B${ultimoPedido}`);
        } else {
            getSheetData('obter', `A${ultimoPedido - 20}:B${ultimoPedido}`);
        }
    }
    if (typeof dados !== 'number') {
        hideLoading();      
        
        let abrirPedidonoFormulario = document.getElementById('abrirPedidonoFormulario');
        let tabelaPedidoBuscado = document.getElementById('tabelaPedidoBuscado');
        let listaOrdenadaItemPedido = document.getElementById('listaOrdenadaItemPedido');
        tabelaPedidoBuscado.className = 'd-inline table';
        document.getElementById('divListaPedido').innerHTML = "";
        if(dados.length > 1){
            preencherTabelaListaDePedidos(dados);
            abrirPedidonoFormulario.className = "d-none"; 
        }
        if(dados[0][0] == ''){
            document.getElementById('divListaPedido').innerHTML = "Pedido não encontrado";
            tabelaPedidoBuscado.className = 'd-none';
            abrirPedidonoFormulario.className = "d-none";
            listaOrdenadaItemPedido.innerHTML = '';
        }
        if (dados.length == 1 && dados[0][0] !== '') {
            abrirPedidonoFormulario.className = "btn btn-primary armazenamento";            
            preencherTabelaPedidoBuscado(dados);
        }
    };
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
    ordemHeader.textContent = '#';
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