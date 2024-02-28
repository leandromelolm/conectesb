let script_url = "https://script.google.com/macros/s/AKfycbwinNzlcMVLXIwArbLb7GHSVpptldKfFSAkX1fk5_j-QMqIEMyX0MiDGkLZYAFitY6YMQ/exec";

const produtoList = document.getElementById("produto-list");
const modalLoading = new bootstrap.Modal(document.getElementById("loading"), {});
let listObj;
let sheetName;
// ../user/admin/estoque-admin.html?sheet={NOME_DA_FOLHA_DA_PLANILHA}
window.onload = () => {
    document.getElementById("divInputUrl").style.display = "none";
    document.getElementById("btnLoadingSave").style.display = "none";

    const checkUser = checkAuth();

    if (checkUser.auth) {
        modalLoading.show();
        getUserSheet(checkAuth().id);
    }     
    if (!checkUser.auth) {
        sheetName =  "PaginaTest";
        console.log( typeof window.location.href.split('?')[1]);
        if (typeof window.location.href.split('?')[1] !== "undefined") {
            if(window.location.href.split('?')[1] !== "") {
                window.location.href = window.location.href.split('?')[0];
            }            
        }        
        document.getElementById("sheetName").innerHTML = sheetName;
        reload_data();
    }
        
    selectShowData(document.getElementById("selectShowData").value);
    ajustarVisualizacao();
    
    let ss = localStorage.getItem("estoque-admin_select_sort");
    if(ss != null || ss != undefined) {
        document.getElementById("selectSort").value = ss;
    }
}

async function getUserSheet(id) {
    let res = await fetch(`${script_url}?authuser=true&id=${id}`);
    const data = await res.json();
    let paramUrl = obterParametroDaURL();
    modalLoading.hide();
    sheetName =  data.content.sheet;
    document.getElementById("sheetName").innerHTML = sheetName;
    reload_data();
    if(paramUrl.sheet === null && paramUrl.sheet !== data.content.sheet)
        setParameterUrl(data.content.sheet);
}

function setParameterUrl(param) {
    let novoValor = param;
    if (novoValor.trim() !== '') {
        let urlAtual = new URL(window.location.href);
        urlAtual.searchParams.set('sheet', novoValor);
        window.history.replaceState({}, '', urlAtual.href);
    }
}

let elSelectShowData = document.getElementById("selectShowData");
elSelectShowData.addEventListener("change", () => {
    selectShowData(elSelectShowData.value);
})

const loadingData = (attrib) => {
    document.getElementById("loadingData").style.display = attrib;
}

function selectShowData(s) {
    if (s === "showlist") {
        document.getElementById("showDataInList").style.display = "block";
        document.getElementById("showDataInTable").style.display = "none";
    }
    if (s === "showtable") {
        document.getElementById("showDataInList").style.display = "none";
        document.getElementById("showDataInTable").style.display = "block";
    }
}

function ajustarVisualizacao() {
    const larguraDaJanela = window.innerWidth;
    if (larguraDaJanela < 768) {
        document.getElementById("showDataInList").style.display = "block";
        document.getElementById("showDataInTable").style.display = "none";
        document.getElementById("selectShowData").value = "showlist";
    } else {
        document.getElementById("showDataInList").style.display = "none";
        document.getElementById("showDataInTable").style.display = "block";
        document.getElementById("selectShowData").value = "showtable";
    }
}
// window.addEventListener("resize", ajustarVisualizacao);

function salvar() {
    document.getElementById("btnSalvar").style.display = "none";
    document.getElementById("btnLoadingSave").style.display = "block";
    let id = $("#id").val();
    if (id.length == 0) {
        insert_value();
    } else {
        update_value();
    }
}

async function insert_value() {
    let id = $("#id").val();
    let codigo = $("#codigo").val();
    let item = encodeURI($("#item").val());
    let marca = encodeURI($("#marca").val());
    let validade = $("#validade").val();
    let quantidade = $("#quantidade").val();
    let url = `${script_url}?sheet=${encodeURI(sheetName)}&codigo=${codigo}&item=${item}&marca=${marca}&validade='${validade}&quantidade=${quantidade}&action=insert`;
    try {
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            responseMessage(data.content, "adicionado", "success");
            reload_data();
            clear_form();
            closeModal();
            document.getElementById("btnSalvar").style.display = "block";
            document.getElementById("btnLoadingSave").style.display = "none";
        }
    } catch (error) {
        console.log("erro ao inserir", error);
        alert(`erro ao inserir: ${error}`);
        closeModal();
        reload_data();
        document.getElementById("btnSalvar").style.display = "block";
        document.getElementById("btnLoadingSave").style.display = "none";
    }
}

async function update_value() {
    let id = $("#id").val();
    let codigo = $("#codigo").val();
    let item = encodeURI($("#item").val());
    let marca = encodeURI($("#marca").val());
    let validade = $("#validade").val();
    let quantidade = $("#quantidade").val();
    let url = `${script_url}?sheet=${encodeURI(sheetName)}&codigo=${codigo}&item=${item}&marca=${marca}&validade='${validade}&quantidade=${quantidade}&id=${id}&action=update`;
    try {
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            responseMessage(data, "alterado", "warning");
            reload_data();
            clear_form();
            closeModal();
            document.getElementById("btnSalvar").style.display = "block";
            document.getElementById("btnLoadingSave").style.display = "none";
        }
    } catch (error) {
        console.log("erro ao atualizar", error);
        alert(`erro ao atualizar: ${error}`);
        closeModal();
        reload_data();
    }
}

async function delete_value(id) {
    // modalLoading.show();
    loadingData("block");
    let url = `${script_url}?sheet=${encodeURI(sheetName)}&id=${id}&action=delete`;
    try {
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            responseMessage(data, "deletado", "danger");
            reload_data();
        }
    } catch (error) {
        console.log("erro ao deletar", error);
        alert(`erro ao deletar: ${error}`);
        closeModal();
    }
}

async function read_value() {
    // modalLoading.show();
    loadingData("block");
    let url = `${script_url}?sheet=${encodeURI(sheetName)}&action=read`;
    try {
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            const recordsArray = data.records;
            listObj = recordsArray.reverse();
            sortList(selectSort.value, listObj);
            // localStorage.setItem("lista_estoque", JSON.stringify(listObj));
            // modalLoading.hide();
            loadingData("none");
            $("#response").css("visibility", "visible");
            createTableElementWithData(listObj);
        } else {
            // modalLoading.hide();
            loadingData("none");
            console.log("Erro na solicitação dos dados");
        }
    } catch (error) {
        console.log(error);
//         alert(`Verifique se você está logado ou
// verifique se o endereço está digitado corretamente na url do navegador. Parâmetro usado: ${sheetName} `);
        // window.history.back();
        // window.location.replace("../../");
        window.location.replace("estoque-admin.html");
    }    
}
{/* <h6 class="mb-0 text-success text-center">${list[i].QUANTIDADE} </h6> */}
function loadInPageListItem(list) {
    let listItem = document.getElementById('listItem');
    let item = [];

    for (let i = 0; i < list.length; i++) {
        item.push(`
        <div class="list-group">
            <span  class="span__list-group-item" aria-current="true">                
              <div style="border-bottom: groove;">
                  <div class="d-flex w-100 justify-content-between">
                        <div>                        
                          <h6 class="mb-1">${list[i].ITEM}</h6>
                          <div class="">
                              <small>VALIDADE: ${formatDate(list[i].VALIDADE)} </small>
                          </div>
                          <div class="mb-1">
                            <div>
                                <small class="text-secondary"> ID </small>
                                <small class="text-black-50">${list[i].ID} </small>
                                <small class="text-secondary"> CODIGO: </small>
                                <small class=""> ${list[i].CODIGO} </small>
                            </div>
                            <small class="text-secondary"> MARCA:</small>
                            <small class=""> ${list[i].MARCA} </small>                              
                          </div>
                        </div>
                        <div class="align-self-center text-center">
                            <h5 class="rounded-pill text-success-emphasis bg-success-subtle border border-success-subtle">${list[i].QUANTIDADE}</h5>
                            <button class="btn__update btn btn-outline-link d-flex align-items-center" data-record='${JSON.stringify(list[i])}'><i class="bi bi-three-dots-vertical"></i></button>
                            <button class="btn" id="deleteButton_${list[i].ID}">
                                <i class="bi bi-trash3" aria-hidden="true" id="deleteButton_${list[i].ID}"></i>
                                <span class="visually-hidden">Deletar</span>
                            </button>
                        </div>
                    </div>
                </div>                
            </span>
        </div>        
        `);
    };
    listItem.innerHTML = item.join('');
}

document.addEventListener('click', function(event) {
    const btn__update = event.target.closest('.btn__update');

    if (btn__update) {
        const recordData = JSON.parse(btn__update.dataset.record);
        preencherForm(recordData);
        const html = document.querySelector('html');
        // html.scrollTop = '0px';
        document.getElementById('tituloModal').innerHTML = "Editar";
        openModal();
    }
});

let listaFiltrada;

let selectSort = document.getElementById("selectSort");
selectSort.addEventListener("change", () => {
    localStorage.setItem("estoque-admin_select_sort", selectSort.value);
    sortList(selectSort.value, listaFiltrada || listObj);
});

function sortList(sort, list) {
    let lista;
    if (sort === "insercao") {
        lista = list.sort(function(a, b) { 
            return b.ID - a.ID;
        })
    }
    if (sort === "alteracao") {
        lista = list.sort(function(a, b) { 
            return b.currentTime.localeCompare(a.currentTime);
        })    
    }
    if (sort === "alfabetica") {
        lista = list.sort(function(a, b) { 
            return a.ITEM.localeCompare(b.ITEM);
        })
    }
    if (sort === "vencimento") {
        lista = list.sort(function(a, b) {
            if (a.VALIDADE !== "" && b.VALIDADE !== "") {
                return a.VALIDADE.localeCompare(b.VALIDADE);
            } else if (a.VALIDADE === "" && b.VALIDADE !== "") {
                // b deve ser classificado antes de a
                return 1;
            } else if (a.VALIDADE !== "" && b.VALIDADE === "") {
                // a deve ser classificado antes de b
                return -1;
            } else {
                // são considerados iguais em termos de classificação
                return 0;
            }
        });
    }    
    if (sort === "quantidade") {
        lista = list.sort(function(a, b) { 
            return a.QUANTIDADE - b.QUANTIDADE;
        })
    }
    loadInPageListItem(lista);
}

let inputSearch = document.getElementById("inputSearch");
inputSearch.addEventListener("input", () => {
    filterList(inputSearch.value);
});

function filterList(inputValue) {
    inputValue = inputValue.toLowerCase();
    let filteredList;
    filteredList = listObj.filter(item => {
        return item.ITEM.toLowerCase().includes(inputValue);
    });
    listaFiltrada = filteredList;
    sortList(selectSort.value, filteredList);
}

function handleSearch() {
    filterList(inputSearch.value);
}

function eventClickEnter(event) {
    if (event.keyCode === 13) {
        handleSearch();
    }
}

let resultado;

document.getElementById("somarBtn").addEventListener("click", function(e) {
    e.preventDefault();
    somar();
}, false);
  
document.getElementById("subtrairBtn").addEventListener("click", function(e) {
    e.preventDefault()
    subtrair(e);
}, false);
  
function somar() {   
    resultado++;
    atualizarResultado();
}

function subtrair() {
    if(resultado > 0){
        resultado--;
    } else {
        resultado = 0
    }
    atualizarResultado();
}

function atualizarResultado() {
    document.getElementById("quantidade").value = resultado;
}

document.getElementById("quantidade").addEventListener('change', () =>{
    resultado = document.getElementById("quantidade").value;
})
  

function abrirModalParaAdicionarItem() {
    document.getElementById('tituloModal').innerHTML = "Adicionar Novo Item";
    clear_form();
    resultado = 0;
    $("#quantidade").val(0);
    openModal();
}

function openModal() {
    $('#modal').modal('show');
    $("#response").css("visibility", "hidden");
}

function closeModal() {
    $('#modal').modal('hide');
}

let deletarItemId;
const modalAlert = new bootstrap.Modal(document.getElementById('modalAlert'));

document.addEventListener('click', function(event) {
    if (event.target && event.target.id.startsWith('deleteButton_')) {
        // Extrai o ID do botão e chama a função delete_value
        const id = event.target.id.split('_')[1];
        
        document.querySelector("#modalAlertBody").innerHTML = `
            ID ${id}. Certeza que deseja apagar?
        `;
        deletarItemId = id;
        modalAlert.show();

        // let confirmar = confirm(`ID ${id}. Certeza que deseja apagar?`);
        // if (confirmar)
        // delete_value(id);
    }
});

document.getElementById('btnConfirmarExcluir').addEventListener('click', function() {
    delete_value(deletarItemId);
    modalAlert.hide();
});

function reload_data() {
    $("#response").css("visibility", "visible");
    read_value();
}

function clear_form() {
    $("#id").val("");
    $("#codigo").val("");
    $("#item").val("");
    $("#marca").val("");
    $("#validade").val("");
    $("#quantidade").val("");
    ulProdutos.innerHTML = '';
}

function preencherForm(data){
    $("#id").val(data.ID);
    $("#codigo").val(data.CODIGO);
    $("#item").val(data.ITEM);
    $("#marca").val(data.MARCA);
    $("#validade").val(data.VALIDADE);
    $("#quantidade").val(data.QUANTIDADE);
    resultado = data.QUANTIDADE;
}

function formatDate(date) {
    if (date == "") {
        return ""
    }
    let d = date.split("-");
    let dt = [d[2], d[1], d[0]].join("/");
    let du = daysUntil(date);
    if (du >= 90)
        return `<span class="text-success"> ${dt}. ${daysUntil(date)} dias de validade </span>`;
    if (du < 120 && du > 1)
        return ` <b class="text-danger"> ${dt}. Vence em ${daysUntil(date)} dias </b>`;
    if ( du < 0 )
        return `<b class="text-secondary"> ${dt}. Item vencido </b>`;
    if (du === 1)
        return ` <b class="text-danger"> ${dt}. Vence amanhã </b>`;
    if (du === 0)
        return `<b class="text-danger"> Item vence hoje  </b>`; 
}

function daysUntil(targetDate) {
    const target = new Date(targetDate);
    const today = new Date();
    const differenceInMilliseconds = target - today;
    const differenceInDays = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));
    return differenceInDays;
}

function responseMessage(data, op, typeAlert) {
    document.querySelector(".div__message-response").style.display = "block";
    if (op === "deletado"){
        data["currentTime"] = new Date().toLocaleString();
        appendAlert(op, typeAlert, data);
    } else {
        appendAlert(op, typeAlert, data);
    }
}

const alertResponseMessage = document.getElementById('response')
const appendAlert = (op, type, data) => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible fade show" role="alert">`,
    `    Item ${op}! Id: <strong> ${data.id}</strong>. Data: ${data.currentTime}`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>'
  ].join('')

  alertResponseMessage.append(wrapper)
}

const ulProdutos = document.querySelector('.ul__produtos')

let selectedIndex = -1;

document.querySelector('#item').addEventListener('input', ({ target }) => {
    console.log("item input", target.value);
    const dadosDoCampo = target.value;

    if (dadosDoCampo.length) {
        const autoCompleteValores = autoComplete(dadosDoCampo);

        ulProdutos.innerHTML = `
            ${autoCompleteValores.map((value) => {
                return (
                    `
                        <a onclick="preencherInput('${value.NOME}', '${value.CADUM}')">
                            <li class="li__input-options-produtos">
                                ${value.NOME}
                            </li>
                        </a>
                    `
                );
            }).join('')}
        `;

        selectedIndex = -1;
    } else {
        ulProdutos.innerHTML = '';
    }
});

function preencherInput(nome, cadum) {
    document.getElementById('codigo').value = cadum;
    document.getElementById('item').value = nome;
    ulProdutos.innerHTML = '';
}

function autoComplete(produtoNome) {
    return produtos.filter((p) => {
        const valorMinusculo = p.NOME.toLowerCase()
        const produtoNomeMinus = produtoNome.toLowerCase()

        return valorMinusculo.includes(produtoNomeMinus)
    })
}

document.querySelector('.input__item').addEventListener('keydown', (event) => {
    const items = ulProdutos.querySelectorAll('li');

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        updateSelectedIndex(items);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateSelectedIndex(items);
    } else if (event.key === 'Enter' && selectedIndex !== -1) {
        event.preventDefault();
        let produto = findCadumByName(items[selectedIndex].textContent.trim());
        preencherInput(produto.NOME, produto.CADUM);
    }
});

function findCadumByName(nomeProduto) {
    const objetoEncontrado = produtos.find(p => p.NOME === nomeProduto);
    return objetoEncontrado ? objetoEncontrado : null;
}

function updateSelectedIndex(items) {
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedIndex);
    });
}

document.getElementById("item").addEventListener("blur", (e) => {
    console.log("teste", e.value);
    setTimeout( ()=> {
        ulProdutos.innerHTML = '';
    },500);    
})

function obterParametroDaURL() {
    const url = new URL(window.location.href);
    const parametros = new URLSearchParams(url.search);
    const sheet = parametros.get('sheet');
    return { sheet };
}

function atualizarParametroURL() {
    var novoValor = document.getElementById('inputUrl').value;
    if (novoValor.trim() !== '') {
      var urlAtual = new URL(window.location.href);
      urlAtual.searchParams.set('sheet', novoValor);
      window.history.replaceState({}, '', urlAtual.href);
      window.location.href = urlAtual.href;
    }
  }

  document.getElementById('inputUrl').addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
      atualizarParametroURL();
    }
  });

let txtSearchDataTable;

function createTableElementWithData(data) {
    $("#response").css("visibility", "hidden");
    // modalLoading.show();
    loadingData("block");

    let table = document.createElement("table");
    table.id = "productTable";
    table.className = "table table-bordered table-striped";
    table.setAttribute('data-page-length', '100');
    table.setAttribute('data-order', '[[2, "asc"]]');

    const thead = document.createElement('thead');
    const theadRow = document.createElement('tr');

    const th1 = document.createElement('th');
    const th2 = document.createElement('th');
    const th3 = document.createElement('th');
    const th4 = document.createElement('th');
    const th5 = document.createElement('th');
    const th6 = document.createElement('th');
    const th7 = document.createElement('th');
    const th8 = document.createElement('th');
    const th9 = document.createElement('th');
    const th10 = document.createElement('th');

    th1.textContent = '#ID';
    th2.textContent = 'CADUM';
    th3.textContent = 'ITEM';
    th4.textContent = 'MARCA';
    th5.textContent = 'QTD ESTOQUE';
    th6.textContent = 'DATA DE VALIDADE';
    th7.textContent = 'VENCE EM (DIAS)';
    th8.textContent = 'MODIFICADO EM';
    th9.textContent = '';
    th10.textContent = '';

    theadRow.appendChild(th1);
    theadRow.appendChild(th2);
    theadRow.appendChild(th3);
    theadRow.appendChild(th4);
    theadRow.appendChild(th5);
    theadRow.appendChild(th6);
    theadRow.appendChild(th7);
    theadRow.appendChild(th8);
    theadRow.appendChild(th9);
    theadRow.appendChild(th10);

    thead.appendChild(theadRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    for (let i = 0; i < data.length; i++) {

        let tr = tbody.insertRow(-1);
        let tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data[i].ID;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data[i].CODIGO;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data[i].ITEM;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data[i].MARCA;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = `<b class="text-success">${data[i].QUANTIDADE}</b>`;

        let dv = "";
        if(data[i].VALIDADE.trim().length === 10){
            const [ano, mes, dia] = data[i].VALIDADE.split('-');
            const dataValidade = new Date(ano, mes - 1, dia);
            dv = dataValidade.toLocaleDateString('pt-BR');
        }
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = dv;

        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = prazoDeValidade(data[i].VALIDADE);
        let pv = daysUntil(data[i].VALIDADE);
        if (pv >= 120){
            tabCell.style.cssText= `
                background-color: #D1E7DD;
                color: #0F5132
            `;
        }
        if (pv < 120 && pv >= 0) {
            tabCell.style.cssText= `
                background-color: #FFF3CD;
                color: #664D03
            `;
        }
        if (pv < 0) {
            tabCell.style.cssText= `
                background-color: #F8D7DA;
                color: #842029
            `;
        }

        tabCell = tr.insertCell(-1);
        let d = new Date(data[i].currentTime)
        tabCell.innerHTML = d.toLocaleString();

        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = `
        <button class="btn btn__update" data-record='${JSON.stringify(data[i])}'>
            <i class="bi bi-pencil-square btn__update" data-record='${JSON.stringify(data[i])}' aria-hidden="true"></i>
            <span class="visually-hidden">Editar</span>
        </button>`;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = `
        <button class="btn" id="deleteButton_${data[i].ID}">
            <i class="bi bi-trash3" aria-hidden="true" id="deleteButton_${data[i].ID}"></i>
            <span class="visually-hidden">Deletar</span>
        </button>`;
    }

    table.appendChild(tbody);

    let divContainer = document.getElementById("showDataInTable");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);

    // modalLoading.hide();
    loadingData("none");
    $("#response").css("visibility", "visible");

    if ($.fn.DataTable.isDataTable('#productTable')) {
        $('#productTable').DataTable().destroy();
    }

    $(document).ready(function () {
        $('#productTable').DataTable({
            "aaSorting": [],
            "search": {
                "search": txtSearchDataTable
            },
            "language": {
                "search": "Pesquisar:",
                "searchPlaceholder": "Digite para pesquisar...",
                "lengthMenu": "Mostrar _MENU_ itens por página",
                "info": "Mostrando _START_ a _END_ de _TOTAL_ itens",
                "infoEmpty": "Mostrando 0 a 0 de 0 itens",
                "infoFiltered": "(filtrado de _MAX_ itens no total)",
                "zeroRecords": "Nenhum registro correspondente encontrado",
                "paginate": {
                    "first": "Primeiro",
                    "previous": "Anterior",
                    "next": "Próximo",
                    "last": "Último"
                }
            }
        });

        $('#productTable_filter input').on('keyup', function () {
            txtSearchDataTable = this.value;
        });
    });      
}

function prazoDeValidade(date) {   
    if (date == "")
        return "-"
    let du = daysUntil(date);
    if (du >= 120)
        return du;
    if (du < 120 && du > 1)
        return du;
    if ( du < 0 )
        return 0;
    if (du === 1)
        return du;
    if (du === 0)
        return du;
}


/*
  Esta função não está atualmente em uso, mas está mantida no código para eventual uso no futuro.
  Função para Fazer um clone da lista de objetos retornado no get.
*/
function cloneListObj(listObj) {
    let listClone = [];
    // listClone = Object.assign({}, listObj);
    // listClone = {...listObj};
    i = -1;
    while (++i < listObj.length) {
        listClone[i] = listObj[i];
    }
    return listClone;
}


/*
<span  class="span__list-group-item" aria-current="true">                
    <div>
        <div class="d-flex w-100 justify-content-between">
            <div>                        
                <h6 class="mb-1">${list[i].ITEM}</h6>                    
                <div>
                    <small class="mb-1 text-black-50"> ${list[i].ID}</small>
                </div>
                <small class="mb-1">COD:${list[i].CODIGO} |</small>
                <small class="mb-1">MARCA:${list[i].MARCA} </small>
                <div class="mb-1">
                    <small>VALIDADE: ${formatDate(list[i].VALIDADE)}</small>
                </div>
                <div>
                    <button class="btn__update btn btn-outline-success" data-record='${JSON.stringify(list[i])}'>Editar</button>
                    <button class="btn btn-outline-danger" id="deleteButton_${list[i].ID}">Deletar</button>
                </div>
            </div>
            <h3 class="d-flex align-items-center">${list[i].QUANTIDADE}</h3>
        </div>
    </div>                
</span>

*/