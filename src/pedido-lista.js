let ultimaAtualizacaoDaPagina = document.getElementById('ultimaAtualizacaoDaPagina');
let msgNovoPedido = document.getElementById('msgNovoPedido');
let abrirPedidonoFormulario = document.getElementById('abrirPedidonoFormulario');
let id = "";
let search = "";
let pageNumber = 1;
let perPage = 60;
let startId = 1; // startId e endId apenas são validos na pesquisa quando search for atribuido o valor 'pesquisarIntervalo'
let endId = 1;
let ultimoPedidoRegitrado;

const modalLoading = new bootstrap.Modal(document.getElementById("loading"), {});

window.onload = async () => {
    showLoading();
    ultimoPedidoRegitrado = localStorage.getItem('ultimoPedido');
    let listaDePedidos = localStorage.getItem('listaDePedidos');    
     
    if (JSON.parse(localStorage.getItem('filtro-distrito-ativo'))) {        
        findByDistrito(localStorage.getItem('filtro-distrito'), localStorage.getItem('filtro-distrito-perpage'));        
    } else {        
        if (listaDePedidos) {
            preencherTabelaListaDePedidos(JSON.parse(listaDePedidos));
            let totalPages = localStorage.getItem("lista-pedidos-totalPages");
            totalPages = totalPages === null ? 0 : totalPages;
            buildPaginationButtons(totalPages, pageNumber);
            document.querySelector("#selectDistrito").value = "todos";
        }
    }
    atualizarPagina();
};

async function atualizarPagina() {
    toggleBtnAtualizar(true);
    ultimaAtualizacaoDaPagina.innerText = "";
    // showLoading();
    try {
        const responseLastRow = await fetch('/.netlify/functions/api-spreadsheet?lastRow=true')
        .then(res => res.json());
        ultimaAtualizacaoDaPagina.innerText = `Última atualização: ${dateFormat(new Date())}`;        
        verificarSeFiltroEstaAtivo(responseLastRow.res.body.lastRow);
        toggleBtnAtualizar(false);
        hideLoading();
    } catch (error) {
        toggleBtnAtualizar(false);
        hideLoading();
        alert(`Erro na requisição para atualizar lista. Messagem: ${error}` );
        console.error(error); 
    }
}

function verificarSeFiltroEstaAtivo(ultimoPedido) {
    if (verificarNovosPedidos(ultimoPedido)){
        if(JSON.parse(localStorage.getItem('filtro-distrito-ativo'))) {
            findByDistrito(localStorage.getItem('filtro-distrito'), localStorage.getItem('filtro-distrito-perpage'));
        } else {
            obterListaAtualizada();
        }
    }
}

function verificarNovosPedidos(ultimoPedido) {
    if ( ultimoPedido != ultimoPedidoRegitrado || ultimoPedidoRegitrado == null){
        let up = ultimoPedido == null ? ultimoPedidoRegitrado : ultimoPedido; 
        localStorage.setItem('ultimoPedido', up);
        ultimoPedidoRegitrado = up;
        return true;
    } else {
        return false;
    }
}

function btnAtualizarPagina() {
    if (!JSON.parse(localStorage.getItem('filtro-distrito-ativo'))) {
        toggleBtnAtualizar(true);
        obterListaAtualizada();
    } else {
        atualizarPagina();
    }
}

function eventClickEnter(event) {
    if (event.keyCode === 13) {
        handleSearch();
    }
}

function handleSearch() {
    var txtSearch = document.getElementById('search-input').value;
    searchTxt(txtSearch);    
    document.querySelector("#selectDistrito").value = "todos";
};

document.getElementById("search-input").addEventListener("input", (e) =>{
    const btnClear = document.getElementById("btn-clear");
    e.target.value.length > 0 ? btnClear.classList.remove("d-none") : btnClear.classList.add("d-none");    
});

document.getElementById("search-input").addEventListener("change", (e) =>{
    console.log(e.target.value);
});

document.querySelector("#selectDistrito").addEventListener('change', (e) =>{
    let perPageSize = localStorage.getItem('filtro-distrito-perpage') || 60 ;
    findByDistrito(e.target.value, perPageSize);
})

function searchTxt(txtSearch){
    desabilitarBotaoPesquisa(true);
    document.getElementById('response__erro').innerHTML = '';
    if (!txtSearch) {
        buildPaginationButtons(localStorage.getItem("lista-pedidos-totalPages"), 1);
        return preencherTabelaListaDePedidos(JSON.parse(localStorage.getItem('listaDePedidos')));
    }    
    if (isPositiveInteger(txtSearch)) { 
        return findById(txtSearch,"","","","","");
    }
    if(Math.sign(txtSearch) == -1 || Math.sign(txtSearch) == 0) {
        return document.getElementById('response__erro').innerHTML = 'Numero de pedido inválido';
    }
    if (!isPositiveInteger(txtSearch)){
        document.querySelector("#selectDistrito").value = "todos";
        return findByNameUnidade(txtSearch);
    }    
};

function isPositiveInteger(n) {
    return /^\d+$/.test(n) && parseInt(n, 10) > 0;
}

function findById(id) {
    modalLoading.show();
    findByPedido(id,"","","","","");
}

function findByNameUnidade(nomeUnidade) {
    document.getElementById("paginationButtons").innerHTML = "";
    findByPedido("", nomeUnidade,"","","","");
}

function findByPedido(id, search, pageNumber, perPage, startId, endId){
    showLoading();
    fetch(`/.netlify/functions/api-spreadsheet?id=${id}&search=${search}&page=${pageNumber}&perPage=${perPage}&startId=${startId}&endId=${endId}`)
    .then( data => {
        return data.json();
    })
    .then( response =>{
        verificarDados(response);
        desabilitarBotaoPesquisa(false);
    })
    .catch(function (error) {
        hideLoading();
        modalLoading.hide();
        desabilitarBotaoPesquisa(false);
        alert(`Erro na Requisição: ${error}`);
        document.getElementById('response__erro').innerHTML = "Pesquisa não encontrada. Insira um número de pedido válido.";
        console.error("erro: ",error);
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
    } 
    else {
        mostrarDetalhesDoPedidoNoModal(data.responseDataPedidos);
        hideLoading();        
    }
};

function preencherTabelaListaDePedidos(arr) {
    hideLoading();
    desabilitarBotaoPesquisa(false);
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
    const distritoHeader = document.createElement('th');
    distritoHeader.textContent = 'DS';
    // const grupoHeader = document.createElement('th');
    // grupoHeader.textContent = 'Grupo Material';

    theadRow.appendChild(ordemHeader);
    theadRow.appendChild(dataHeader);
    theadRow.appendChild(unidadeHeader);
    theadRow.appendChild(distritoHeader);
    // theadRow.appendChild(grupoHeader);
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
        cell3.style.cssText = `display: grid`;
        const linkUnid = document.createElement('a');
        linkUnid.textContent = item.nomeUnidade; 
        linkUnid.href = 'javascript:void(0)';
        linkUnid.style.textDecoration = 'none';
        linkUnid.style.fontSize = '15px';
        linkUnid.addEventListener('click', function () {
            document.getElementById("search-input").value = item.id;                    
            searchTxt(item.id);
            // scrollToTop();
            document.getElementById("btn-clear").classList.remove("d-none");
        });
        cell3.appendChild(linkUnid);
        const spanEquipe = document.createElement('span');
        spanEquipe.style.cssText = `font-size: small; color: dimgrey;`;
        spanEquipe.innerHTML = `Equipe: ${item.equipe}`;
        cell3.appendChild(spanEquipe);
        const spanGrupoMaterial = document.createElement('span');
        spanGrupoMaterial.style.cssText = `font-size: small; color: dimgrey;`;
        spanGrupoMaterial.innerHTML = `${item.grupoMaterial}`;
        cell3.appendChild(spanGrupoMaterial);

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

        const cell4 = row.insertCell();
        cell4.textContent = item.distrito;

        // const cell5 = row.insertCell();
        // cell5.textContent = item.grupoMaterial;
    }); 
    tabelaDiv.appendChild(table);
};

function mostrarDetalhesDoPedidoNoModal(pedido) {
    abrirPedidonoFormulario.className = "btn btn-primary armazenamento";
    document.getElementById('divPedidoBuscado').className = 'card';
    document.getElementById('labelPedido').innerHTML = `<b style="color:#0051A2">${pedido.id}</b> | <b>Data:</b> ${dateFormat(pedido.dataPedido)} `;
    document.getElementById('requisitante').innerHTML = 
    `<div style="display:grid">
        <div>
            <span style="font-size:small"><b>Unidade:</b> ${pedido.nomeUnidade}</span>        
        </div>
        <div>
            <span style="font-size:small"> <b>Equipe:</b> ${pedido.requisitante.equipe}</span>
            <span style="font-size:small"> <b>Grupo de Material:</b> ${pedido.requisitante.grupoMaterial}</span>
        </div>
    </div>
    `;
    document.getElementById('unidadeRequisitante').value = pedido.requisitanteStr;
    document.getElementById('listaPedido').value = pedido.itensStr; 
    const tabela = document.getElementById("tableItensPedido").getElementsByTagName('tbody')[0];
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
    openModal();
    modalLoading.hide();
};


function openModal() {
    $('#modalMostrarPedido').modal('show');
}

function closeModal() {
    document.querySelector("#search-input").value = "";
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
    sessionStorage.setItem('dadosRequerente', unidadeRequisitante)
    sessionStorage.setItem('dadosItens', itensDados);
    // window.open('pedido-fazer.html', '_blank');
    window.location.href = 'pedido-fazer';
};

function limparCampos() {
    document.getElementById('unidadeRequisitante').value = '';
    document.getElementById('listaPedido').value = '';
    document.getElementById("btn-clear").classList.add("d-none");
};

function limparTodosCampos(){
    limparCampos();
    document.querySelector("#selectDistrito").value = "todos";
    document.getElementById('divListaPedido').innerHTML = "";
    document.getElementById("search-input").value = "";
    divPedidoBuscado = document.getElementById('divPedidoBuscado');
    divPedidoBuscado.className = 'd-none table';
    let listaDePedidos = localStorage.getItem('listaDePedidos');
    preencherTabelaListaDePedidos(JSON.parse(listaDePedidos));
    buildPaginationButtons(localStorage.getItem("lista-pedidos-totalPages"), 1);
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

function desabilitarBotaoPesquisa(bStatus) {
    document.getElementById('btn-search').disabled = bStatus;    
};

function showLoading() {
    document.querySelector(".div__loading-message").style.display = "block";
    document.getElementById("content").style.display = "none";
};

function hideLoading() {
    document.querySelector(".div__loading-message").style.display = "none";
    document.getElementById("content").style.display = "block";
};

function toggleBtnAtualizar(toggle){
    let btnAtualizarPagina = document.getElementById('btnAtualizarPagina');
    if (toggle) {
        btnAtualizarPagina.innerHTML = `
        <div id="spinner" class="spinner-border div__spinner-border" role="status"></div> Buscando pedidos...  Aguarde.
        `;
        btnAtualizarPagina.disabled = true;      
    } else {
        btnAtualizarPagina.innerHTML = `
        <img src="assets/arrow-clockwise.svg" alt="Atualizar"/> Atualizar
        `;
        btnAtualizarPagina.disabled = false;      
    }
}

function buildPaginationButtons(totalPages, currentPage) {
    let paginationContainer = document.getElementById("paginationButtons");
    paginationContainer.innerHTML = "";

    // btn Anterior
    let prevButton = document.createElement("button");
    prevButton.classList.add("btn");
    // prevButton.textContent = "Anterior";
    prevButton.disabled = currentPage === 1;

    let imgLeft = document.createElement("img");
    // img.src = "assets/arrow-left-circle-fill.svg";
    imgLeft.src = "assets/chevron-left.svg";
    imgLeft.alt = "Anterior";

    prevButton.appendChild(imgLeft);

    prevButton.addEventListener("click", function() {
        if (currentPage > 1) {
            currentPage--;
            obterListaDePedido(currentPage);
        }
    });
    paginationContainer.appendChild(prevButton);

    // paginaAtual/todasPaginas  
    let elspan = document.createElement("span");
    elspan.className = "span__current-page";
    elspan.textContent = `${currentPage} de ${totalPages}`;    
    paginationContainer.appendChild(elspan);
    

    // btn Proximo
    let nextButton = document.createElement("button");
    nextButton.classList.add("btn");
    // nextButton.textContent = "Próxima";
    nextButton.disabled = currentPage === totalPages;

    let imgRight = document.createElement("img");
    // imgRight.src = "assets/arrow-right-circle-fill.svg";
    imgRight.src = "assets/chevron-right.svg";
    imgRight.alt = "Próximo";

    nextButton.appendChild(imgRight);

    nextButton.addEventListener("click", function() {
        if (currentPage < totalPages) {
            currentPage++;
            obterListaDePedido(currentPage);
        }
    });
    paginationContainer.appendChild(nextButton);
}

async function obterListaDePedido(pageNumber) {
    try {
        modalLoading.show();    
        const data = await fetchPedidos('', '', pageNumber, perPage);
        preencherTabelaListaDePedidos(data.responseDataPedidos.data);
        buildPaginationButtons(data.responseDataPedidos.totalPages,data.responseDataPedidos.pageNumber);
        modalLoading.hide();        
    } catch (error) {
        alert("Erro na requisição da lista. Messagem:", error);
        modalLoading.hide();
    }
}

async function obterListaAtualizada() {
    try {
        // showLoading();
        ultimaAtualizacaoDaPagina.innerText = ``;
        const data = await fetchPedidos('', '', '', perPage);
        buildPaginationButtons(data.responseDataPedidos.totalPages,data.responseDataPedidos.pageNumber);
        preencherTabelaListaDePedidos(data.responseDataPedidos.data);
        localStorage.setItem('listaDePedidos',JSON.stringify(data.responseDataPedidos.data));
        localStorage.setItem("lista-pedidos-totalPages", data.responseDataPedidos.totalPages);
        // msgNovoPedido.innerText = `Último pedido: ${dateFormat(data.responseDataPedidos.data[0].dataPedido)}`;
        document.querySelector("#selectDistrito").value = "todos";
        toggleBtnAtualizar(false);
        ultimaAtualizacaoDaPagina.innerText = `Última atualização: ${dateFormat(new Date())}`;
        hideLoading();
    } catch (error) {        
        toggleBtnAtualizar(false);
        hideLoading();
        alert("Erro na requisição para atualizar lista. Messagem:", error);
        console.error(error);        
    }    
}

async function fetchPedidos(id, search, pageNumber, perPage){
    const res = await fetch(`/.netlify/functions/api-spreadsheet?id=${id}&search=${search}&page=${pageNumber}&perPage=${perPage}`);    
    const data = await res.json();
    return data;
}

document.querySelector("#paginationButtons").addEventListener('change', (e) => {
    if (e.target.id === 'mostrarQtdFiltro') {
        findByDistrito(document.querySelector("#selectDistrito").value, e.target.value);
    }
});

async function findByDistrito(distrito, perPage) {    
    try {
        document.getElementById("search-input").value = "";
        if(distrito === "todos"){
            localStorage.setItem('filtro-distrito-ativo', false);
            buildPaginationButtons(localStorage.getItem("lista-pedidos-totalPages"), 1);
            preencherTabelaListaDePedidos(JSON.parse(localStorage.getItem('listaDePedidos')));
        } else {
            modalLoading.show();
            localStorage.setItem('filtro-distrito-ativo', true);
            let res;
            if (localStorage.getItem('filtro-distrito-pedido-ult-registro') == ultimoPedidoRegitrado 
                && distrito === localStorage.getItem('filtro-distrito')
                && perPage == localStorage.getItem('filtro-distrito-perpage')
            ) {
                res =  JSON.parse(localStorage.getItem("filtro-distrito-pedido-lista"));    
            } else {
                const result = await fetch(`/.netlify/functions/api-spreadsheet?id=${id}&search=${search}&page=${pageNumber}&perPage=${perPage}&startId=${startId}&endId=${endId}&distrito=${distrito}`)
                res = await result.json();
            }
            
            let paginationContainer = document.getElementById("paginationButtons");
            if (res.responseDataPedidos.data !== undefined){
                preencherTabelaListaDePedidos(res.responseDataPedidos.data);
                const txtResult = res.responseDataPedidos.totalElementsFound === 1 ? 'resultado': 'resultados';
                paginationContainer.innerHTML = `
                <div class="d-flex my-3">
                    <div class="me-2"> 
                        <b>${res.responseDataPedidos.totalElementsFound} ${txtResult}</b>                    
                    </div>
                    <label class="me-1">Mostrar:</label>
                    <select name="mostrarQtdFiltro" id="mostrarQtdFiltro" class="select__mostrar-qtd-filtro">                    
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                        <option value="50">50</option>
                        <option value="60">60</option>
                        <option value="100">100</option>                    
                    </select>
                </div>
                `;
                const selectElement = document.getElementById("mostrarQtdFiltro");
                selectElement.value = perPage;
                document.querySelector("#selectDistrito").value = distrito;
                localStorage.setItem("filtro-distrito-pedido-lista", JSON.stringify(res));
                localStorage.setItem("filtro-distrito", distrito);
                localStorage.setItem('filtro-distrito-pedido-ult-registro', localStorage.getItem("ultimoPedido"));
                localStorage.setItem('filtro-distrito-perpage', perPage);                
            } else {
                document.getElementById('divListaPedido').innerHTML = "";
                paginationContainer.innerHTML =`Nenhum registro encontrado`;
            }
            modalLoading.hide();
            toggleBtnAtualizar(false);
        }        
    } catch (error) {
        console.log(error);
        alert("erro na busca por distrito. Tente novamente!");
        document.querySelector("#selectDistrito").value = "todos";
        modalLoading.hide();
    }
}