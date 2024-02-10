let script_url = "https://script.google.com/macros/s/AKfycbwinNzlcMVLXIwArbLb7GHSVpptldKfFSAkX1fk5_j-QMqIEMyX0MiDGkLZYAFitY6YMQ/exec";

const produtoList = document.getElementById("produto-list");
const modalLoading = new bootstrap.Modal(document.getElementById("loading"), {});
let listObj;

window.onload = () => {
    reload_data();
    document.getElementById("btnLoadingSave").style.display = "none";   
}

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
    try {
        const res = await fetch(script_url + "?id=" + id + "&codigo=" + codigo + "&item=" + item + "&marca=" + marca + "&validade=" + "'" + validade + "&quantidade=" + quantidade + "&action=insert");
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
        reload_data();
    }
}

async function update_value() {
    let id1 = $("#id").val();
    let codigo = $("#codigo").val();
    let item = encodeURI($("#item").val());
    let marca = encodeURI($("#marca").val());
    let validade = $("#validade").val();
    let quantidade = $("#quantidade").val();
    let url = script_url + "?callback=ctrlq&codigo=" + codigo + "&item=" + item + "&marca=" + marca + "&validade=" + "'" + validade + "&quantidade=" + quantidade + "&id=" + id1 + "&action=update";

    const res = await fetch(url);

    if (res.ok) {
        const text = await res.text();
        const jsonString = text.match(/\(([^)]+)\)/)[1];
        const data = JSON.parse(jsonString);
        responseMessage(data, "alterado", "warning");
        reload_data();
        clear_form();
        closeModal();
        document.getElementById("btnSalvar").style.display = "block";
        document.getElementById("btnLoadingSave").style.display = "none";
    }
}

async function delete_value(id) {
    modalLoading.show();
    try {
        const res = await fetch(script_url + "?callback=ctrlq&id=" + id + "&action=delete");
        if (res.ok) {
            const text = await res.text();
            const jsonString = text.match(/\(([^)]+)\)/)[1];
            const data = JSON.parse(jsonString);
            responseMessage(data, "deletado", "danger");
            reload_data();
        }
    } catch (error) {
        console.log("erro ao deletar", error);
    }
}

function read_value() {
    modalLoading.show();
    let url = script_url + "?action=read";

    $.getJSON(url, function (json) {        
        listObj = json.records.reverse();        
        // cloneListObj(listObj);
        sortList(selectSort.value, listObj);
        modalLoading.hide();
        $("#response").css("visibility", "visible");
    });
}

function loadInPageListItem(list) {
    let listItem = document.getElementById('listItem');
    let item = [];

    for (let i = 0; i < list.length; i++) {
        item.push(`            
        <span  class="list-group-item list-group-item-action" aria-current="true">                
            <div>
                <div class="d-flex w-100 justify-content-between">
                    <div>
                        <h5 class="mb-1">${list[i].ITEM}</h5>
                        <div>
                            <small class="mb-1 text-black-50"> ${list[i].ID}</small>
                        </div>
                        <small class="mb-1">COD:${list[i].CODIGO} |</small>
                        <small class="mb-1">MARCA:${list[i].MARCA} </small>
                        <div class="mb-1">
                            <small>VALIDADE: ${formatDate(list[i].VALIDADE)}</small>
                        </div>
                        <div>
                            <button class="updateButton btn btn-outline-success" data-record='${JSON.stringify(list[i])}'>Editar</button>
                            <button class="btn btn-outline-danger" id="deleteButton_${list[i].ID}">Deletar</button>
                        </div>
                    </div>
                    <h3 class="d-flex align-items-center">${list[i].QUANTIDADE}</h3>
                </div>
            </div>                
        </span>
        `);            
    };
    listItem.innerHTML = item.join('');
}

let listaFiltrada;

let selectSort = document.getElementById("selectSort");
selectSort.addEventListener("change", () => {
    sortList(selectSort.value, listaFiltrada || listObj);
});

function sortList(sort, list) {    
    if (sort === "insercao") {
        let lista = list.sort(function(a, b) { 
            return b.ID - a.ID;
        })
        loadInPageListItem(lista);
    }
    if (sort === "alteracao") {
        let lista = list.sort(function(a, b) { 
            return b.currentTime.localeCompare(a.currentTime);
        })
        loadInPageListItem(lista);        
    }
    if (sort === "alfabetica") {
        let lista = list.sort(function(a, b) { 
            return a.ITEM.localeCompare(b.ITEM);
        })
        loadInPageListItem(lista);
    }
    if (sort === "vencimento") {
        let lista = list.sort(function(a, b) {
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
        loadInPageListItem(lista);
    }    
    if (sort === "quantidade") {
        let lista = list.sort(function(a, b) { 
            return a.QUANTIDADE - b.QUANTIDADE;
        })
        loadInPageListItem(lista);
    }
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
    resultado--;
    atualizarResultado();
}

function atualizarResultado() {
    document.getElementById("quantidade").value = resultado;
}
  

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

document.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('updateButton')) {
        const recordData = JSON.parse(event.target.dataset.record);
        preencherForm(recordData);
        const html = document.querySelector('html');
        // html.scrollTop = '0px';
        document.getElementById('tituloModal').innerHTML = "Editar";
        openModal();
    }
});

document.addEventListener('click', function(event) {
    if (event.target && event.target.id.startsWith('deleteButton_')) {
        // Extrai o ID do botão e chama a função delete_value
        const id = event.target.id.split('_')[1];
        let confirmar = confirm("Certeza que deseja apagar?");
        if (confirmar)
        delete_value(id);
    }
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

function responseMessage1(data, op, typeAlert) {
    if (op === "deletado"){
        document.querySelector("#response").innerHTML = `
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
  <strong>Holy guacamole!</strong> You should check in on some of those fields below.
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
        `
    } else {
        document.querySelector("#response").innerHTML = `
        <div class="toast align-items-center text-bg-primary border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                Hello, world! This is a toast message.
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
        `
    }
}

function responseMessage(data, op, typeAlert) {
    document.querySelector(".div_message-response").style.display = "block";
    if (op === "deletado"){
        document.querySelector("#response").innerHTML = `
        <div class="alert alert-${typeAlert} alert-dismissible fade show" role="alert">
           Item ${op} com sucesso! Id: <strong> ${data.id}</strong>.
           <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `
    } else {
        document.querySelector("#response").innerHTML = `
        <div class="alert alert-${typeAlert} alert-dismissible fade show" role="alert">
           Item ${op} com sucesso! Id: <strong> ${data.id}</strong>. Instante: ${data.currentTime}
           <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `
    }
}

const ulProdutos = document.querySelector('.ul__produtos')

let selectedIndex = -1;

document.querySelector('.input__item').addEventListener('input', ({ target }) => {
    const dadosDoCampo = target.value;

    if (dadosDoCampo.length) {
        const autoCompleteValores = autoComplete(dadosDoCampo);

        ulProdutos.innerHTML = `
            ${autoCompleteValores.map((value) => {
                return (
                    `<li class="li__input-options-produtos">
                        <a onclick="preencherInput('${value.NOME}', '${value.CADUM}')">${value.NOME}</a>
                    </li>`
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



// FUNÇÕES DE TESTE

async function insert_data_callback() {
    modalLoading.show();
    let id = $("#id").val();
    let codigo = $("#codigo").val();
    let item = $("#item").val();
    let marca = $("#marca").val();
    let validade = $("#validade").val();
    let quantidade = $("#quantidade").val();

    let url = script_url + "?callback=ctrlq&id=" + id + "&codigo=" + codigo + "&item=" + item + "&marca=" + marca + "&validade=" + validade + "&quantidade=" + quantidade + "&action=insert";

    try {
        // ?callback=ctrlq
        const res = await fetch(url);
        if (res.ok) {
            const text = await res.text();
            const jsonString = text.match(/\(([^)]+)\)/)[1];
            const data = JSON.parse(jsonString);
            reload_data()
        }
    } catch (error) {
        console.log("erro ao inserir", error);
        reload_data()
    }
}

// Make an AJAX call to Google Script
function insert_value_ajax() {
    $("#response").css("visibility", "hidden");
    modalLoading.show();
    let id1 = $("#id").val();
    let item = $("#item").val();
    let url = script_url + "?callback=ctrlq&item=" + item + "&id=" + id1 + "&action=insert";
    let request = jQuery.ajax({
        crossDomain: true,
        url: url,
        method: "GET",
        dataType: "jsonp"
    });
    console.log(request);
    reload_data();
}

function read_value_2() {
    $("#response").css("visibility", "hidden");
    modalLoading.show();
    let url = script_url + "?action=read";

    $.getJSON(url, function (json) {
        let table = document.createElement("table");

        let header = table.createTHead();
        let row = header.insertRow(0);
        // let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(0);
        let cell3 = row.insertCell(1);
        let cell4 = row.insertCell(2);
        let cell5 = row.insertCell(3);
        let cell6 = row.insertCell(4);
        let cell7 = row.insertCell(5);
        let cell8 = row.insertCell(6);

        // cell1.innerHTML = `<b>ID</b>`;
        cell2.innerHTML = "<b>CADUM</b>";
        cell3.innerHTML = "<b>ITEM</b>";
        cell4.innerHTML = "<b>MARCA</b>";
        cell5.innerHTML = "<b>VALIDADE</b>";
        cell6.innerHTML = "<b>QTD</b>";
        cell7.innerHTML = "<b>Update</b>";
        cell8.innerHTML = "<b>Delete</b>";

        json.records.reverse();

        for (let i = 0; i < json.records.length; i++) {

            tr = table.insertRow(-1);
            // let tabCell = tr.insertCell(-1);
            // tabCell.innerHTML = json.records[i].ID;
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = json.records[i].CODIGO;
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = json.records[i].ITEM;
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = json.records[i].MARCA;
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = json.records[i].VALIDADE;
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = json.records[i].QUANTIDADE;
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = `<button 
                      class="updateButton" 
                      data-record='${JSON.stringify(json.records[i])}'>Edit</button>`;
            tabCell = tr.insertCell(-1);
            // tabCell.innerHTML = `<button onclick="delete_value(${json.records[i].ID})">Del</button>`;
            tabCell.innerHTML = `<button id="deleteButton_${json.records[i].ID}">Del</button>`;
            
        }

        let divContainer = document.getElementById("showData");
        divContainer.innerHTML = "";
        divContainer.appendChild(table);
        modalLoading.show();
        $("#response").css("visibility", "visible");
    });
}


const produtos = [
    {CADUM:23898,NOME:'ABAIXADOR DE LINGUA BRUENINGS, EM ACO INOX'},
    {CADUM:14368,NOME:'ABRIDOR DE BOCA ADULTO EM MATERIAL PLASTICO'},
    {CADUM:8242,NOME:'ABRIDOR DE BOCA INFANTIL EM MATERIAL PLASTICO'},
    {CADUM:44867,NOME:'ADESIVO PARA ESMALTE E DENTINA, FRASCO COM 6ML'},
    {CADUM:7315,NOME:'AFASTADOR DE FARABEUF ADULTO 14CMX13MM, EM ACO INOX'},
    {CADUM:7316,NOME:'AFASTADOR DE FARABEUF ADULTO 7CMX100MM, EM ACO INOX'},
    {CADUM:24243,NOME:'AFASTADOR MINESSOTA EM ACO INOX'},
    {CADUM:38140,NOME:'AGUA DESTILADA, EMBALAGEM C/ 5 LITROS'},
    {CADUM:8113,NOME:'AGULHA GENGIVAL 27G LONGA, DESCARTAVEL, ESTERIL, TRIBISELADA E SILICONIZADA, CAIXA C/ 100 UNIDADES'},
    {CADUM:29879,NOME:'AGULHA GENGIVAL 30G , DESCRATAVEL, ESTERIL, CAIXA C/ 100 UNIDADES'},
    {CADUM:44957,NOME:'ALAVANCA SELDIN- JOGO DE ALAVANCAS ADULTO EM ALO INOX, CABO OCO, COM 3 PEÇAS. JOGO COM 1 ALAVANCA RETA, 1 ALAVANCA CURVA DIREITA E 1 ALAVANCA CURVA ESQUERDA'},
    {CADUM:26268,NOME:'ALGODÃO EM ROLOS PARA USO ODONTOLOGICO'},
    {CADUM:26306,NOME:'ALGODAO HIDROFILO EM MANTA UNIFORME ENVOLVIDO EM PAPEL EMBALABEM COM 500G'},
    {CADUM:23932,NOME:'ALICATE PERFURADOR AINSWORTH'},
    {CADUM:8321,NOME:'ALVEOLOTOMO CURVO TIPO LUER'},
    {CADUM:8322,NOME:'ALVEOLOTOMO RETO'},
    {CADUM:14611,NOME:'AMALGAMADOR TIPO CAPSULA PRE DOSADA'},
    {CADUM:44793,NOME:'ANESTESICO ODONTO INJET MEPIVACAINA 2% C/VASO CONSTRICTOR (EPINEFR 1:100.000) TUBETE C/1,8ML CX C/50'},
    {CADUM:24055,NOME:'ANESTESICO ODONTOLOGICO INJETAVEL .CLORIDRATO DE LIDOCAINA 2% C/ VASO CONSTRICTOR (EPINEFRINA 1:100'},
    {CADUM:24123,NOME:'ANESTESICO ODONTOLOGICO INJETAVEL CLORIDRATO DE MEPVACAINA 3% SEM VASOCONSTRICTOR / TUBETE COM 1,8'},
    {CADUM:24124,NOME:'ANESTESICO ODONTOLOGICO INJETAVEL CLORIDRATO DE PRILOCAINA 3% COM VASOCONSTRICTOR FELIPRESSINA 0,'},
    {CADUM:8125,NOME:'ANESTESICO ODONTOLOGICO TOPICO EM GEL &#150;BENZOCAINA 20% (200MG/G), NOS SABORES MORANGO, ABACAXI, MENTA'},
    {CADUM:29273,NOME:'APARELHO DE RAIO X, CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:27704,NOME:'APARELHO FOTOPOLIMERIZADOR TIPO LED, CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:28635,NOME:'APARELHO JATO DE BICARBONATO C/ ULTRASOM, CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:45559,NOME:'APLICADOR DE IONOMERO DE VIDRO EM CAPSULA RIVA'},
    {CADUM:14468,NOME:'APLICADOR PORTA DYCAL DUPLO'},
    {CADUM:34942,NOME:'ARCO DE OSTBY ADULTO PARA ISOMALENTO ABSOLUTO, NÃO DOBRÁVEL, CONFECCIONADO EM MATERIAL PLASTICO FLEXÍVEL E ESTERELIZÁVEL'},
    {CADUM:14370,NOME:'ARCO DE YOUNG, EM PLASTICO'},
    {CADUM:34944,NOME:'ARCO OSTBY ADULTO PARA ISOLAMENTO ABSOLUTO, DOBRAVEL'},
    {CADUM:34943,NOME:'ARCO OSTBY INFANTIL PARA ISOLAMENTO ABSOLUTO, DOBRAVEL'},
    {CADUM:36699,NOME:'ASPIRADOR CIRURGICO 3L, CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:33909,NOME:'AUTOCLAVE DE BANCADA, CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:37447,NOME:'AUTOCLAVE ODONTOLOGICA HORIZONTAL (21 LITROS) CONFORME PARECER DA ENGENHARIA CLINICA.'},
    {CADUM:41860,NOME:'AVENTAL DESCARTAVEL USO HOSPITALAR, ABERTURA ATRAS, 50 G/M2, MANGA LONGA, PUNHO COM ELASTICO, TAMANH'},
    {CADUM:33236,NOME:'AVENTAL PLUMBIFERO, CONFORME PARECER DA ENGENHARIA'},
    {CADUM:17104,NOME:'BANDEJA INOX 22X09X1,5'},
    {CADUM:14937,NOME:'BANDEJA INOX RETANGULAR PEQUENA 30X20X4 CM, POSSUII O VOLUME DE 1.800 ML'},
    {CADUM:27063,NOME:'BANQUETA GIRATÓRIA (MOCHO A GAS) CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:17940,NOME:'BANQUETA GIRATORIA (MOCHO MECANICO GIRATORIO COM ENCOSTO), CONFORME PARECER DA ENGENHARIA CLINICA.""'},
    {CADUM:46952,NOME:'BARREIRA GENGIVAL FOTOPOLIMERIZÁVEL EM 20 A 30 SEGUNDOS, DE VISCOSIDADE IDEAL(NÃO ESCORRE), DISPONIVEL NAS CORES AZUL E VERDE. EMBALAGEM: SERINGA COM 3G E PONTAS APLICADORAS.'},
    {CADUM:34945,NOME:'BICARBONATO DE SODIO COM GRANULOMETRIA ULTRAFINA PARA USO EM ULTRASSOM ODONTOLOGICO - CAIXA COM 15 S'},
    {CADUM:29424,NOME:'BISTURI ELETRICO, CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:36703,NOME:'BOMBA A VACUO PARA CONSULTORIO ODONTOLOGICO, CONFORME PARECER DA ENGENHARIA CLINICA.'},
    {CADUM:42238,NOME:'BROCA CARBIDE DE BAIXA ROTACAO ESFERICA NÂº 4'},
    {CADUM:42239,NOME:'BROCA CARBIDE DE BAIXA ROTACAO ESFERICA NÂº 8'},
    {CADUM:44796,NOME:'BROCA CARBIDE FG PARA ALTA ROTACAO NÂº701'},
    {CADUM:44795,NOME:'BROCA CARBIDE FG PARA ALTA ROTACAO NÂº702'},
    {CADUM:24160,NOME:'BROCA CARBIDE FG PARA ALTA ROTACAO NÂº703'},
    {CADUM:44838,NOME:'BROCA CARBIDE PARA ALTA ROTAÇAO , ESFERICA Nº 4'},
    {CADUM:44794,NOME:'BROCA CARBIDE PM PARA PECA RETA NÂº 702 HL'},
    {CADUM:42242,NOME:'BROCA CIRURGICA ZEKRYA MAILLEFER DE ALTA ROTACAO DE 23MM'},
    {CADUM:42243,NOME:'BROCA CIRURGICA ZEKRYA MAILLEFER DE ALTA ROTACAO DE 28MM'},
    {CADUM:24162,NOME:'BROCA DE TUNGSTENIO NO FORMATO PERA PARA PEÇA RETA CORTE CRUZADO'},
    {CADUM:24233,NOME:'BROCA DE TUNGSTENIO PARA PEÇA RETA CORTE CRUZADO FINO, DIAMETRO 6 MM'},
    {CADUM:34948,NOME:'BROCA DIAMANTADA 2200 DE ALTA ROTACAO'},
    {CADUM:34947,NOME:'BROCA DIAMANTADA 3168F DE ALTA ROTACAO'},
    {CADUM:30553,NOME:'BROCA DIAMANTADA CHAMA FG 1111'},
    {CADUM:30554,NOME:'BROCA DIAMANTADA CHAMA FG 1111F'},
    {CADUM:30555,NOME:'BROCA DIAMANTADA CHAMA FG 1111FF'},
    {CADUM:30561,NOME:'BROCA DIAMANTADA CHAMA FG 3118F'},
    {CADUM:8140,NOME:'BROCA DIAMANTADA CHAMA FG 3118FF'},
    {CADUM:30551,NOME:'BROCA DIAMANTADA CILINDRICA FG 1090G'},
    {CADUM:30550,NOME:'BROCA DIAMANTADA CILINDRICA TOPO PLANO FG 1090'},
    {CADUM:8139,NOME:'BROCA DIAMANTADA CILINDRICA TOPO PLANO FG 1092'},
    {CADUM:30552,NOME:'BROCA DIAMANTADA CILINDRICA TOPO PLANO FG 1092F'},
    {CADUM:30548,NOME:'BROCA DIAMANTADA CONE INVERTIDA FG 1034'},
    {CADUM:24117,NOME:'BROCA DIAMANTADA CONE-INVERTIDA FG1035'},
    {CADUM:8138,NOME:'BROCA DIAMANTADA CONICA DUPLA (CARRETEL) FG 1045'},
    {CADUM:24158,NOME:'BROCA DIAMANTADA CONICA DUPLA (CARRETEL) FG1046'},
    {CADUM:8141,NOME:'BROCA DIAMANTADA CONICA TOPO EM CHAMA 3195 FF'},
    {CADUM:34950,NOME:'BROCA DIAMANTADA CONICA TOPO EM CHAMA 3195F'},
    {CADUM:30557,NOME:'BROCA DIAMANTADA CONICA TOPO EM CHAMA FG 1190F'},
    {CADUM:30558,NOME:'BROCA DIAMANTADA CONICA TOPO EM CHAMA FG 1190FF'},
    {CADUM:8132,NOME:'BROCA DIAMANTADA ESFERICA FG 1012'},
    {CADUM:30545,NOME:'BROCA DIAMANTADA ESFERICA FG 1012 HL'},
    {CADUM:8133,NOME:'BROCA DIAMANTADA ESFERICA FG 1014'},
    {CADUM:8134,NOME:'BROCA DIAMANTADA ESFERICA FG 1014 HL'},
    {CADUM:8135,NOME:'BROCA DIAMANTADA ESFERICA FG 1016'},
    {CADUM:8136,NOME:'BROCA DIAMANTADA ESFERICA FG 1016HL'},
    {CADUM:8142,NOME:'BROCA ENDO Z FG NÂº 152 21 MM'},
    {CADUM:8143,NOME:'BROCA GATES GLIDDEN NÂº1 DE 32MM (CX C/06UNDS)'},
    {CADUM:8144,NOME:'BROCA GATES GLIDDEN NÂº2 DE 32MM (CX C/06UNDS)'},
    {CADUM:8145,NOME:'BROCA GATES GLIDDEN NÂº3 DE 32MM (CX C/06UNDS)'},
    {CADUM:44797,NOME:'BROCA GATES NÂº 4 DE 32 MM'},
    {CADUM:46942,NOME:'BROCA GATES NÂº 5 (CX C/06UNDS)'},
    {CADUM:8146,NOME:'BROCA SHOFU TIPO CHAMA DE VELA'},
    {CADUM:8147,NOME:'BROCA SHOFU TIPO CILINDRICA'},
    {CADUM:8148,NOME:'BROCA SHOFU TIPO TROCO-CONICA ( PONTA DE LAPIS )'},
    {CADUM:45517,NOME:'BROQUEIRO PARA USO ODONTOLÓGICO EM ALUMINIO COM 15 FUROS AUTOCLAVÁVEL'},
    {CADUM:24109,NOME:'BRUNIDOR OVOIDE PARA AMALGAMA EM ACO INOX, N 34'},
    {CADUM:24106,NOME:'BRUNIDOR OVOIDE PARA AMALGAMA, EM ACO INOX NÂº29'},
    {CADUM:24159,NOME:'CABO DE BISTURI NÂº 04, EM ACO INOXIDAVEL'},
    {CADUM:19470,NOME:'CABO DE BISTURI TIPO BARD PARKER NÂº 3'},
    {CADUM:14369,NOME:'CABO PARA ESPELHO BUCAL NÂº5'},
    {CADUM:43193,NOME:'CADEIRA ODONTOLOGICA CONFORME PARECER DA ENGENHARIA CLINICA.'},
    {CADUM:8344,NOME:'CAIXA EM ACO INOX COM TAMPA E ALCA 32X22X06CM'},
    {CADUM:8345,NOME:'CAIXA EM ACO INOX PARA ENDODONTIA COM 36 FUROS'},
    {CADUM:8342,NOME:'CAIXA INOX COM TAMPA 18X08X03CM'},
    {CADUM:14936,NOME:'CAIXA INOX COM TAMPA 20X10X05'},
    {CADUM:8343,NOME:'CAIXA INOX COM TAMPA 25X10X05CM'},
    {CADUM:44792,NOME:'CAIXA INOX COM TAMPA 45 X 08 X 05CM'},
    {CADUM:13011,NOME:'CALCADOR TIPO PAIVA EM ACO INOX JOGO COM 4 INSTRUMENTOS NÂº1/ NÂº2/ NÂº3 E NÂº4'},
    {CADUM:42839,NOME:'CALEN - PASTA ENDODONTICA A BASE DE HIDROXIDO DE CALCIO EM EMBALAGEM CONTENDO 2 TUBETES DE PASTA DE"'},
    {CADUM:18110,NOME:'CAMARA DE REVELACAO ODONTOLOGICA, CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:40252,NOME:'CAMARA DE REVELACAO ODONTOLOGICA, CONFORME PARECER DA ENGENHARIA CLINICA.'},
    {CADUM:14605,NOME:'CANETA DE ALTA ROTACAO, CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:14437,NOME:'CANULA DE SUCCAO METALICA PARA PROCEDIMENTOS CIRURGICOS'},
    {CADUM:42618,NOME:'CAPSULAS DE AMALGAMA DE PRATA PRE DOSADAS, DUAS PORCOES, COM TEOR DE 40% DE PRATA, 31,1% DE ESTANHO'},
    {CADUM:42241,NOME:'CHAVE UNIVERSAL PARA PONTA DE ULTRASSOM'},
    {CADUM:42622,NOME:'CIMENTO DE HIDROXIDO DE CALCIO, EMBALAGEM CONTENDO PASTA BASE (13G) E PASTA CATALISADORA (11G) RADIO'},
    {CADUM:32591,NOME:'CIMENTO DE IONOMERO DE VIDRO QUIMICAMENTE ATIVADO, COR A3 UNIVERSAL'},
    {CADUM:42623,NOME:'CIMENTO DE OXIDO DE ZINCO (PO), EMBALAGEM COM 50G'},
    {CADUM:42608,NOME:'CIMENTO ENDODONTICO A BASE DE HIDROXIDO DE CALCIO , EM EMBALAGEM CONTENDO: 01 FRASCO DE PO (8G) E 01'},
    {CADUM:42624,NOME:'CIMENTO FOSFATO DE ZINCO (LIQUIDO) FRASCO COM 10ML'},
    {CADUM:42625,NOME:'CIMENTO FOSFATO DE ZINCO (PO) COR CLARA ,POTE 28G. COMPOSICAO: OXIDO DE ZINCO, OXIDO DE MAGNESIO , C'},
    {CADUM:42268,NOME:'CIMENTO RESTAURADOR A BASE DE IONOMERO DE VIDRO REFORCADO COM RESINA E FOTOPOLIMERIZAVEL, ALTA LIBER'},
    {CADUM:42626,NOME:'CIMENTO RESTAURADOR INTERMEDIARIO REFORCADO ( IRM ) A BASE DE OXIDO DE ZINCO E EUGENOL (LIQUIDO), FR'},
    {CADUM:31627,NOME:'CIMENTO RESTAURADOR INTERMEDIARIO REFORCADO ( IRM ) A BASE DE OXIDO DE ZINCO E EUGENOL (PO), POTE CO'},
    {CADUM:8346,NOME:'CINZEL CANELADO (GOIVA ), EM ACO INOX 15 CM'},
    {CADUM:8348,NOME:'CINZEL MICRO OCHSENBEIN NÂº1, EM ACO INOX'},
    {CADUM:8349,NOME:'CINZEL MICRO OCHSENBEIN NÂº2, EM ACO INOX'},
    {CADUM:8350,NOME:'CINZEL MICRO OCHSENBEIN NÂº3, EM ACO INOX'},
    {CADUM:8351,NOME:'CINZEL RETO BISELADO SIMPLES, EM ACO INOX'},
    {CADUM:46843,NOME:'CLIPE LABIAL PARA LOCALIZADOR APICAL METÁLICO ESTERILIZÁVEL- DIMENSÕES: 7,0 CM X 1,5 CM.'},
    {CADUM:14374,NOME:'COLGADURA (PRENDEDOR PARA RADIOGRAFIA), EM ACO INOX'},
    {CADUM:37435,NOME:'COMPRESSOR ODONTOLOGICO- 3 CONSULTORIOS CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:28584,NOME:'COMPRESSOR ODONTOLOGICO PARA 01 (UM) CONSULTORIO, CONFORME PARECER DA'},
    {CADUM:37444,NOME:'COMPRESSOR ODONTOLOGICO PARA 2 CONSULTORIOS CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:14435,NOME:'CONDENSADOR DE WARD PARA AMALGAMA NÂº 1, EM ACO INOX'},
    {CADUM:14436,NOME:'CONDENSADOR DE WARD PARA AMALGAMA NÂº2, EM ACO INOX'},
    {CADUM:32165,NOME:'CONDICIONADOR ACIDO GEL ACIDO FOSFORICO A 37%. SERINGA 2,5 A 3ML'},
    {CADUM:46432,NOME:'CONE PARA OBTURAÇÃO COM CONICIDADE SEMELHANTE AOS INSTRUMENTOS DO SISTEMA RECIPROCANTE E ROTATÓRIO, DIÂMETRO DA PONTA 25 E CONICIDADE 07. COMPRIMENTO DE 28 MM. CAIXA ÚNICA COM 60 PONTAS.'},
    {CADUM:46604,NOME:'CONES DE GUTA PERCHA 02 CALIBRADO N 20 CAIXA COM 120(CENTO E VINTE) PONTAS EM MEDIA'},
    {CADUM:46605,NOME:'CONES DE GUTA PERCHA 02 CALIBRADO N 25 CAIXA COM 120(CENTO E VINTE) PONTAS EM MEDIA'},
    {CADUM:46606,NOME:'CONES DE GUTA PERCHA 02 CALIBRADO N 30 CAIXA COM 120(CENTO E VINTE) PONTAS EM MEDIA'},
    {CADUM:46607,NOME:'CONES DE GUTA PERCHA 02 CALIBRADO N 35 CAIXA COM 120(CENTO E VINTE) PONTAS EM MEDIA'},
    {CADUM:46608,NOME:'CONES DE GUTA PERCHA 02 CALIBRADO N 40 CAIXA COM 120(CENTO E VINTE) PONTAS EM MEDIA'},
    {CADUM:46609,NOME:'CONES DE GUTA PERCHA 02 CALIBRADO N 45 CAIXA COM 120(CENTO E VINTE) PONTAS EM MEDIA'},
    {CADUM:46611,NOME:'CONES DE GUTA PERCHA 02 CALIBRADO N 50 COM 120(CENTO E VINTE) PONTAS EM MEDIA'},
    {CADUM:46612,NOME:'CONES DE GUTA PERCHA 02 CALIBRADO N 55 CAIXA COM 120(CENTO E VINTE) PONTAS EM MEDIA'},
    {CADUM:46613,NOME:'CONES DE GUTA PERCHA 02 CALIBRADO N 60 CAIXA COM 120(CENTO E VINTE) PONTAS EM MEDIA'},
    {CADUM:46614,NOME:'CONES DE GUTA PERCHA 02 CALIBRADO N 70 CAIXA COM 120(CENTO E VINTE) PONTAS EM MEDIA'},
    {CADUM:46615,NOME:'CONES DE GUTA PERCHA 02 CALIBRADO N 80 CAIXA COM 120(CENTO E VINTE) PONTAS EM MEDIA'},
    {CADUM:46599,NOME:'CONES DE GUTA PERCHA ACESSORIA MODELO F CAIXA COM 120(CENTO E VINTE) PONTAS'},
    {CADUM:46603,NOME:'CONES DE GUTA PERCHA ACESSORIA MODELO FF CAIXA COM 120(CENTO E VINTE) PONTAS'},
    {CADUM:46601,NOME:'CONES DE GUTA PERCHA ACESSORIA MODELO FM CAIXA COM 120(CENTO E VINTE) PONTAS'},
    {CADUM:46602,NOME:'CONES DE GUTA PERCHA ACESSORIA MODELO MF CAIXA COM 120(CENTO E VINTE) PONTAS'},
    {CADUM:46417,NOME:'CONES DE PAPEL ABSORVENTE - 28MM DE COMPRIMENTO COM CONICIDADE SEMELHANTE AOS INSTRUMENTOS DO SISTEMA RECIPROCANTE E ROTATÓRIO, DIÂMETRO DA PONTA 20 E CONICIDADE 07; DIÂMETRO DA PONTA 25 E CONICIDADE 07; DIÂMETRO DA PONTA 35 E CONICIDADE 06; DIÂMETRO DA PONTA 45 E CONICIDADE 05. CAIXA COM 60 UNIDADES.'},
    {CADUM:46431,NOME:'CONES PARA OBTURAÇÃO COM CONICIDADE SEMELHANTE AOS INSTRUMENTOS DO SISTEMA RECIPROCANTE E ROTATÓRIO, DIÂMETRO DA PONTA 20 E CONICIDADE 07, DIÂMETRO DA PONTA 25 E CONICIDADE 07, DIAMETRO DA PONTA 35 E CONICIDADE 06, DIÂMETRO DA PONTA 45 E CONICIDADE 05. COMPRIMENTO DE 28 MM. CAIXA SORTIDA COM 60 PONTAS.'},
    {CADUM:31527,NOME:'CONJUNTO DE CAMPOS CIRURGICOS EM POLIPROPILENO CONTENDO: 01 CAMPO FENESTRADO 70CM X 70CM; 02 CAMPOS'},
    {CADUM:35145,NOME:'CONSULTORIO ODONTOLOGICO EQUIPO ACOPLADO, CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:42613,NOME:'CONSULTORIO ODONTOLOGICO PORTATIL CONFORME PARECER DA ENGENHARIA'},
    {CADUM:37438,NOME:'CONSULTORIO ODONTOLOGICO, CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:14583,NOME:'CONTRA ANGULO ACOPLAVEL AO MICRO MOTOR'},
    {CADUM:36698,NOME:'CONTRA-ÂNGULO ODONTOLOGICO, CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:31581,NOME:'CREME DENTAL TEOR DE FLUOR, TUBO 90G'},
    {CADUM:3115,NOME:'CUBA REDONDA DE ACO INOX DE 8 CM'},
    {CADUM:32204,NOME:'CUNHA DE MADEIRA ANATOMICAS SORTIDAS - CAIXA C/ 100 UNIDADES'},
    {CADUM:42267,NOME:'CURATIVO ALVEOLAR COM PROPOLIS. FORMA DE APRESENTACAO: EMBALAGEM COM 2 UNIDADES DE SERINGA COM 3G +'},
    {CADUM:8353,NOME:'CURETA ALVEOLAR DE LUCAS NÂº85, EM ACO INOX'},
    {CADUM:23950,NOME:'CURETA DE GRACEY 13/14, EM ACO INOX, CABO OCO'},
    {CADUM:23952,NOME:'CURETA DE GRACEY 7/8, EM ACO INOX, CABO OCO'},
    {CADUM:23953,NOME:'CURETA DE GRACEY 9/10, EM ACO INOX, CABO OCO'},
    {CADUM:8359,NOME:'CURETA DE MCCALL 13/14, EM ACO INOX, CABO OCO'},
    {CADUM:8360,NOME:'CURETA DE MCCALL 17/18, EM ACO INOX, CABO OCO.'},
    {CADUM:8361,NOME:'CURETA DE MCCALL 19/20, EM ACO INOX, CABO OCO'},
    {CADUM:8363,NOME:'CURETA DENTINA NÂº14, EM ACO INOX'},
    {CADUM:8362,NOME:'CURETA DENTINA NÂº5, EM ACO INOX'},
    {CADUM:23948,NOME:'CURETA ODONTOLOGICA  DE GRACEY 11/12, EM ACO INOX, CABO OCO'},
    {CADUM:23951,NOME:'CURETA ODONTOLOGICA  DE GRACEY 5/6, EM ACO INOX, CABO OCO'},
    {CADUM:14371,NOME:'DESCOLADOR DE PERIOSTEO TIPO MOLT, EM ACO INOX'},
    {CADUM:34938,NOME:'DESTILADOR DE AGUA ( 5 LITROS): ESPECIFICACAO: DESTILADOR TIPO PILSEN'},
    {CADUM:37436,NOME:'DESTILADOR PORTATIL CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:43205,NOME:'DISPOSITIVO ESTABILIZADOR PARA TRATAMENTOS DENTARIOS DE PACIENTES ESPECIAIS. DESCRICAO: REFERE-SE A'},
    {CADUM:24190,NOME:'EDTA TRISSODICO GEL CONCENTRACAO DE 24% SERINGA C/ 3G E BICO APLICADOR'},
    {CADUM:42627,NOME:'EDTA TRISSODICO LIQUIDO, FRASCO C/ 20ML, SOLUBILIDADE APROXIMADAMENTE 30%, PH ENTRE 7,0 E 7,5'},
    {CADUM:12927,NOME:'ESCOVA DE DENTES INFANTIL'},
    {CADUM:12944,NOME:'ESCOVA DE ROBSON.'},
    {CADUM:29041,NOME:'ESCOVODROMO PORTATIL, MODULO DE 06 PIAS'},
    {CADUM:12901,NOME:'ESCULPIDOR DE HOLLEMBACK NÂº3, EM ACO INOX'},
    {CADUM:14372,NOME:'ESCULPIDOR DE HOLLEMBACK NÂº3S, EM ACO INOX'},
    {CADUM:46585,NOME:'ESPACADOR DIGITAL TAMANHO B CAIXA COM 04 (QUATRO) UNIDADES IGUAIS'},
    {CADUM:46586,NOME:'ESPACADOR DIGITAL TAMANHO C CAIXA COM 04 (QUATRO) UNIDADES IGUAIS'},
    {CADUM:46587,NOME:'ESPACADOR DIGITAL TAMANHO D CAIXA COM 04 (QUATRO) UNIDADES IGUAIS'},
    {CADUM:61294,NOME:'ESPATULA EM ACO 24'},
    {CADUM:19472,NOME:'ESPATULA EM AÇO INOX Nº 36'},
    {CADUM:19471,NOME:'ESPATULA EM AÇO INOX Nº7'},
    {CADUM:19473,NOME:'ESPATULA EM ACO INOX, NÂº70'},
    {CADUM:19474,NOME:'ESPATULA EM ACO, NÂº31'},
    {CADUM:23954,NOME:'ESPATULA LECRON GRANDE, EM AÇO INOX'},
    {CADUM:23949,NOME:'ESPATULA LECRON PEQUENA, EM ACO INOX'},
    {CADUM:45805,NOME:'ESPATULA PARA RESINA TITANIO NÂº6 ESTERELIZAVEL, EM ACO INOX E SILICONE'},
    {CADUM:14452,NOME:'ESPELHO BUCAL PLANO NÂº5, EM ACO INOX, SEM CABO'},
    {CADUM:42246,NOME:'ESPONJA HEMOSTATICA OBTIDA DE GELATINA LIOFILIZADA 100% DE ORIGEM PORCINA, ESTERILIZADA POR RAIOS GA'},
    {CADUM:28909,NOME:'ESTETOSCOPIO ADULTO E INFANTIL, CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:27586,NOME:'ESTOJO EM INOX 20X10X05CM ESTAMPADO E PERFURADO'},
    {CADUM:32585,NOME:'EUGENOL, FRASCO 20 ML'},
    {CADUM:42248,NOME:'FILME RADIOGRAFICO OCLUSAL, USO ODONTOLOGICO, DIMENSAO 57MM X 76MM, ALTA VELOCIDADE. CAIXA COM 25 UN'},
    {CADUM:42247,NOME:'FILME RADIOGRAFICO PERIAPICAL INFANTIL, USO ODONTOLOGICO, DIMENSÃO: 22MMX 35MM. ALTA VELOCIDADE, CAIXA COM 100 UNIDADES'},
    {CADUM:42635,NOME:'FILME RADIOGRAFICO PERIAPICAL, USO ODONTOLOGICO, CAIXA C/ 150 UNIDADES DE 3X4CM'},
    {CADUM:36704,NOME:'FILTRO REGULADOR DE PRESSAO PARA COMPRESSOR ODONTOLOGICO CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:30342,NOME:'FIO DE SUTURA NYLON 3.0 - CUTICULAR 45CM - 3/8 - 2,5 CM'},
    {CADUM:42620,NOME:'FIO DE SUTURA NYLON MONOFILA, CALIBRE 5-0, NAO ABSORVIVEL, ESTERIL, CAIXA COM 24 ENVELOPES.'},
    {CADUM:42636,NOME:'FIO DE SUTURA NYLON MONOFILAMEN, CALIBRE 4-0, NAO ABSORVI, ESTER, 45 CM, AGUL Â½ CAIXA COM 24 ENVE'},
    {CADUM:42637,NOME:'FIO DE SUTURA SEDA PRETA TRANCADA, CALIBRE 3-0 C/ AGULHA 1,7 CORTANTE, Â½ DE CIRCULO, CAIXA C/ 24 UNI'},
    {CADUM:30382,NOME:'FIO DE SUTURA SEDA PRETA TRANCADA, CALIBRE 4-0, COM AGULHA 1,7 CORTANTE, CAIXA COM 24 UNIDADES'},
    {CADUM:11798,NOME:'FIO DENTAL; SEM SABOR; EMBALAGEM COM 100M'},
    {CADUM:32306,NOME:'FITA MATRIZ DE ACO INOX 0,05X5X500 MM'},
    {CADUM:32304,NOME:'FITA MATRIZ DE ACO INOX 0,05X7X500 MM'},
    {CADUM:31582,NOME:'FLUORETO DE SODIO 2% PH NEUTRO, TIXOTROPICO EM GEL, SEM CORANTE, TEMPO DE ACAO 4 MINUTOS, TUBO COM 2'},
    {CADUM:23945,NOME:'FORCEPS ADULTO NÂº1, ACO INOX.'},
    {CADUM:23946,NOME:'FORCEPS ADULTO NÂº150, ACO INOX.'},
    {CADUM:8375,NOME:'FORCEPS ADULTO NÂº151, ACO INOX.'},
    {CADUM:8376,NOME:'FORCEPS ADULTO NÂº16, ACO INOX.'},
    {CADUM:8377,NOME:'FORCEPS ADULTO NÂº17, ACO INOX.'},
    {CADUM:8378,NOME:'FORCEPS ADULTO NÂº18L, ACO INOX.'},
    {CADUM:8379,NOME:'FORCEPS ADULTO NÂº18R, ACO INOX.'},
    {CADUM:8380,NOME:'FORCEPS ADULTO NÂº65, ACO INOX.'},
    {CADUM:8381,NOME:'FORCEPS ADULTO NÂº68, ACO INOX.'},
    {CADUM:8382,NOME:'FORCEPS ADULTO NÂº69, ACO INOX.'},
    {CADUM:8383,NOME:'FORCEPS INFANTIL NÂº1, ACO INOX.'},
    {CADUM:8384,NOME:'FORCEPS INFANTIL NÂº5, ACO INOX'},
    {CADUM:42788,NOME:'FORMOCRESOL DILUIDO (1/5)-VALIDADE 02 ANOS- FRASCO COM 10 ML.'},
    {CADUM:14439,NOME:'GENGIVOTOMO DE KIRKLAND, CABO OCO, EM ACO INOX'},
    {CADUM:14440,NOME:'GENGIVOTOMO DE ORBAN, CABO OCO, EM ACO INOX'},
    {CADUM:23181,NOME:'GRAMPO PARA DIQUE DE BORRACHA ESPECIAL NÂº201, EM ACO INOX'},
    {CADUM:23183,NOME:'GRAMPO PARA DIQUE DE BORRACHA ESPECIAL NÂº202, EM ACO INOX'},
    {CADUM:23184,NOME:'GRAMPO PARA DIQUE DE BORRACHA ESPECIAL NÂº203, EM ACO INOX'},
    {CADUM:23185,NOME:'GRAMPO PARA DIQUE DE BORRACHA ESPECIAL NÂº204, EM ACO INOX'},
    {CADUM:23186,NOME:'GRAMPO PARA DIQUE DE BORRACHA ESPECIAL NÂº205, EM ACO INOX'},
    {CADUM:23187,NOME:'GRAMPO PARA DIQUE DE BORRACHA ESPECIAL NÂº206, EM ACO INOX'},
    {CADUM:23188,NOME:'GRAMPO PARA DIQUE DE BORRACHA ESPECIAL NÂº207, EM ACO INOX'},
    {CADUM:23189,NOME:'GRAMPO PARA DIQUE DE BORRACHA ESPECIAL NÂº208, EM ACO INOX'},
    {CADUM:23190,NOME:'GRAMPO PARA DIQUE DE BORRACHA ESPECIAL NÂº209, EM ACO INOX'},
    {CADUM:23191,NOME:'GRAMPO PARA DIQUE DE BORRACHA ESPECIAL NÂº210, EM ACO INOX'},
    {CADUM:23192,NOME:'GRAMPO PARA DIQUE DE BORRACHA ESPECIAL NÂº211, EM ACO INOX'},
    {CADUM:23193,NOME:'GRAMPO PARA DIQUE DE BORRACHA ESPECIAL NÂº212, EM ACO INOX'},
    {CADUM:23194,NOME:'GRAMPO PARA DIQUE DE BORRACHA ESPECIAL NÂº26 ESPECIAL, EM ACO INOX'},
    {CADUM:23195,NOME:'GRAMPO PARA DIQUE DE BORRACHA ESPECIAL NÂºW8A, EM ACO INOX'},
    {CADUM:27894,NOME:'GRAMPO PARA DIQUE DE BORRACHA NÂ° 203'},
    {CADUM:27895,NOME:'GRAMPO PARA DIQUE DE BORRACHA NÂ° 210'},
    {CADUM:23163,NOME:'GRAMPO PARA DIQUE EM BORRACHA NÂº200, EM ACO INOX'},
    {CADUM:48532,NOME:'GUTA PERCHA 02 CALIBRADA - CONE DE GUTAPERCHA CALIBRADO PARA OBTURAÇÃO DE CANAIS RADICULARES DE CONICIDADE .02, 28MM DE COMPRIMENTO À BASE DE GUTAPERCHA, ÓXIDO DE ZINCO E CORANTE ORGÂNICO. APRESENTAÇÃO COMERCIAL: CAIXA INDIVIDUAL NO CALIBRE NÚMERO 15 COM NO MINIMO 80 (OITENTA) PONTAS EM MÉDIA. MARCAS DE REFERENCIA: DENTSPLY E TANARI'},
    {CADUM:31639,NOME:'HIDROXIDO DE CALCIO PRO-ANALISE, POTE C/ 10G'},
    {CADUM:46108,NOME:'KIT BOCAO DE SAUDE BUCAL ACONDICIONADO EM CAIXA PLASTICA COM DIMENSOES DA CAIXA DE 29X 17X 23 CM COM'},
    {CADUM:30562,NOME:'KIT DE POSICIONADOR RADIOGRÁFICO, TAMANHO ADULTO, ESTERELIZÁVEL QUIMICAMENTE, CONTENDO 4 PEÇAS: SENDO 2 POSICIONADORES LATERAIS POSTERIORES (SUPERIOR E INFERIOR), 1 POSICIONADOR FRONTAL E 1 POSICIONADOR PARA RADIOGRAFIA INTERPROXIMAL BITEWINGS, MORDEDOR DE SILICONE E PEÇAS E PEÇAS DESMONTÁVEIS'},
    {CADUM:304,NOME:'KIT ODONTOLOGICO INCOMPLETO - MARCA KAVO'},
    {CADUM:30791,NOME:'KIT VERNIZ C/ 5% DE FLUORETO DE SODIO'},
    {CADUM:14444,NOME:'LAMPARINA A ALCOOL , EM AÇO INOX, CAPACIDADE DE 40 ML'},
    {CADUM:42602,NOME:'LENCOL DE BORRACHA, ESPESSURA MEDIA, MEIA JARDA - QUADRADO 13X13 CM, CAIXA CONTENDO 26 UNIDADES.'},
    {CADUM:46618,NOME:'LIMA C+ LIMA MANUAL N 08 DE 25'},
    {CADUM:46617,NOME:'LIMA C+ LIMA MANUAL N 10 DE 25MM'},
    {CADUM:46433,NOME:'LIMA ENDODÔNTICA DO TIPO RECIPROCANTE. COMPRIMENTO DE 25MM, FABRICADA EM LIGA NITI CM GOLD, SECÇÃO TRANSVERSAL EM PARALELOGRAMO, COM CONICIDADES 25.07; CAIXA COM 4 UNIDADES.'},
    {CADUM:46416,NOME:'LIMA ENDODÔNTICA DO TIPO RECIPROCANTE; COMPRIMENTO DE 25MM, FABRICADA EM LIGA NITI CM GOLD, SECÇÃO TRANSVERSAL EM PARALELOGRAMO,COM CONICIDADES VARIADAS 20.07; 25.07; 35.06; 45.05; CAIXA COM 4 UNIDADES DE CONICIDADES VARIADAS.'},
    {CADUM:46792,NOME:'LIMA FLEXOFILE MANUAL 1 SERIE: 21MM'},
    {CADUM:46623,NOME:'LIMA FLEXOFILE MANUAL N 15 DE 25MM'},
    {CADUM:46621,NOME:'LIMA FLEXOFILE MANUAL N 20 DE 25MM'},
    {CADUM:46620,NOME:'LIMA FLEXOFILE MANUAL N 25 DE 25MM'},
    {CADUM:42639,NOME:'LIMA HEDSTROEM 1Âª SERIE 25 MM, CAIXA COM 6 UNIDADES'},
    {CADUM:23941,NOME:'LIMA PARA OSSO NÂº12, EM ACO INOX'},
    {CADUM:27077,NOME:'LIMA PARA OSSO TIPO BUCK, EM AÇO INOX'},
    {CADUM:23942,NOME:'LIMA PARA OSSO TIPO SUGARMAN, EM ACO INOX'},
    {CADUM:46797,NOME:'LIMA TIPO FLEXOFILE 1 SERIE - 25MM'},
    {CADUM:46796,NOME:'LIMA TIPO HEDSTOEM 1 SERIE - 25MM'},
    {CADUM:46988,NOME:'LIMA TIPO K 1 SERIE - 25 MM'},
    {CADUM:42646,NOME:'LIMA TIPO K 2Âª SERIE 25 MM, CAIXA COM 6 UNIDADES'},
    {CADUM:8276,NOME:'LIMA TIPO K ESPECIAL 06 21MM, CAIXA COM 6 UNIDADES '},
    {CADUM:8277,NOME:'LIMA TIPO K ESPECIAL 08 21 MM CAIXA COM 6 UNIDADES'},
    {CADUM:46940,NOME:'LIMA TIPO K ESPECIAL 08 25 MM CAIXA COM 6 UNIDADES '},
    {CADUM:8278,NOME:'LIMA TIPO K ESPECIAL 10 21 MM CAIXA COM 6 UNIDADES '},
    {CADUM:46941,NOME:'LIMA TIPO K ESPECIAL 10 25 MM CAIXA COM 6 UNIDADES '},
    {CADUM:46949,NOME:'LIMA TIPO K ESPECIAL 15 25 MM CAIXA COM 6 UNIDADES '},
    {CADUM:5197996,NOME:'LIMA TIPO K N 20 - 25MM'},
    {CADUM:5197998,NOME:'LIMA TIPO K N 25 - 25MM '},
    {CADUM:36697,NOME:'MICROMOTOR ODONTOLOGICO CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:34974,NOME:'MOTOR CIRURGICO ODONTOLOGICO, CONFORME PARECER DA ENGENHARIA CLINICA '},
    {CADUM:42614,NOME:'MOTOR PARA ENDODONTIA CONFORME PARECER DA ENGENHARIA'},
    {CADUM:27118,NOME:'OCULOS DE PROTECAO INCOLOR EM ACRILICO, ANTI-EMBACANTE E ANTI-RISCOS'},
    {CADUM:42604,NOME:'OLEO LUBRIFICANTE PARA CANETA DE ALTA ROTACAO, EM FRASCO SPRAY 70G/100ML. FORMULA A BASE DE OLEO MIN'},
    {CADUM:42791,NOME:'PAPEL CARBONO PARA ARTICULAÇÃO (DUAS CORES) EM BLOCO C/50 TIRAS DE 0,02 MILIMETROS DE ESPESSURA'},
    {CADUM:30544,NOME:'PASTA PROFILATICA COM FLUOR PARA USO ODONTOLOGICO, TUBO COM 90G.'},
    {CADUM:36700,NOME:'PEÇA-RETA ODONTOLOGICA CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:14453,NOME:'PEDRA DE AFIAR INSTRUMENTAL EM CARBURETO DE SILICIO, DUPLA FACE 15 CM'},
    {CADUM:42616,NOME:'PEDRA POMES EM PO EXTRAFINO-VALIDADE 03 ANOS- FRASCO COM 100G.'},
    {CADUM:43417,NOME:'PINCA ANATOMICA DE DISSECCAO SEM DENTE NÂº 18'},
    {CADUM:3075,NOME:'PINCA CRILLE CURVA 14CM'},
    {CADUM:3077,NOME:'PINCA CRILLE RETA 14CM'},
    {CADUM:3078,NOME:'PINCA CRILLE RETA 16CM'},
    {CADUM:19692,NOME:'PINCA DE ALLIS 16CM'},
    {CADUM:27070,NOME:'PINCA DE COLLIN RETA 20 CM, COM 2 DENTES'},
    {CADUM:3080,NOME:'PINCA DE DISSECCAO ANATOMICA 14 CM COM DENTE'},
    {CADUM:14454,NOME:'PINCA DE DISSECCAO ANATOMICA COM DENTE 12CM , EM ACO INOX.'},
    {CADUM:3081,NOME:'PINCA DE DISSECCAO ANATOMICA COM DENTE 16CM'},
    {CADUM:14455,NOME:'PINÇA DE DISSECÇÃO SERRILHADA RETA 14 CM, EM AÇO INOX'},
    {CADUM:28745,NOME:'PINCA DE KELLY 14CM CURVA'},
    {CADUM:34952,NOME:'PINCA DENTE DE RATO 14CM, EM ACO INOX'},
    {CADUM:43449,NOME:'PINCA DENTE DE RATO 18CM, EM ACO INOX, COM TOLERANCIA DE 1CM PARA MAIS OU PARA MENOS'},
    {CADUM:349531000,NOME:'PINCA HALSTEAD MOSQUITO CURVA 12'},
    {CADUM:14456,NOME:'PINÇA HEMOSTATICA MOSQUITO CURVA 12 CM , EM AÇO INOX'},
    {CADUM:14457,NOME:'PINCA HEMOSTATICA MOSQUITO CURVA 14 CM, EM ACO INOX'},
    {CADUM:14458,NOME:'PINCA HEMOSTATICA MOSQUITO RETA 12 CM, EM ACO INOX'},
    {CADUM:14459,NOME:'PINCA HEMOSTATICA MOSQUITO RETA 14 CM, EM ACO INOX'},
    {CADUM:27587,NOME:'PINCA KELLY RETA 14CM'},
    {CADUM:14461,NOME:'PINCA PARA ALGODAO NÂº 17, EM ACO INOX'},
    {CADUM:23931,NOME:'PINCA PORTA GRAMPO DE BREWER, EM ACO INOX'},
    {CADUM:43401,NOME:'PLACA DE ACETATO CRISTAL DE 1 MMP/ PLASTIFIC. A VACUO CAIXA COM 2 UNIDADES'},
    {CADUM:17109,NOME:'PLACA DE VIDRO POLIDA TAMANHO 150X80X06MM (FINA)'},
    {CADUM:17108,NOME:'PLACA DE VIDRO POLIDA TAMANHO 150X80X10MM (MEDIA)'},
    {CADUM:43400,NOME:'PLACA SOFT EM ACETATO DE VINILA 100% P/ PLASTIFI. A VACUO CAIXA COM 5 UNIDADES'},
    {CADUM:5199496,NOME:'PLASTIFICADORA A VACUO ODONTOLOGICA, CONFROME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:46992,NOME:'PONTA DE IRRIGAÇAO NAVITIP 30GA.CORPO DE PLÁSTICO COM PESCOÇO ANGULADO E UMA CÂNULA DE METAL MUITO FINA. PONTA ESTERILIZADA.NÃO É AUTOCLAVÁVEL. FLEXÍVEL. EMBALAGEM COM 20 UNIDADES.SORTIDO.'},
    {CADUM:46588,NOME:'PONTA DE PAPEL ABSORVENTE N 25 CAIXA COM 120 (CENTO E VINTE) PONTAS'},
    {CADUM:46589,NOME:'PONTA DE PAPEL ABSORVENTE N 30 CAIXA COM 120 (CENTO E VINTE) PONTAS'},
    {CADUM:46590,NOME:'PONTA DE PAPEL ABSORVENTE N 35 CAIXA COM 120 (CENTO E VINTE) PONTAS'},
    {CADUM:46591,NOME:'PONTA DE PAPEL ABSORVENTE N 40 CAIXA COM 120 (CENTO E VINTE) PONTAS'},
    {CADUM:46592,NOME:'PONTA DE PAPEL ABSORVENTE N 45 CAIXA COM 120 (CENTO E VINTE) PONTAS'},
    {CADUM:46594,NOME:'PONTA DE PAPEL ABSORVENTE N 50 CAIXA COM 120 (CENTO E VINTE) PONTAS'},
    {CADUM:46593,NOME:'PONTA DE PAPEL ABSORVENTE N 55 CAIXA COM 120 (CENTO E VINTE) PONTAS'},
    {CADUM:46595,NOME:'PONTA DE PAPEL ABSORVENTE N 60 CAIXA COM 120 (CENTO E VINTE) PONTAS'},
    {CADUM:46596,NOME:'PONTA DE PAPEL ABSORVENTE N 70 CAIXA COM 120 (CENTO E VINTE) PONTAS'},
    {CADUM:46597,NOME:'PONTA DE PAPEL ABSORVENTE N 80 CAIXA COM 120 (CENTO E VINTE) PONTAS'},
    {CADUM:48530,NOME:'PONTA DE PAPEL ABSORVENTE PARA SECAGEM DE CANAIS RADICULARES, DE CONICIDADE .02, À BASE DE PAPEL FILTRO. APRESENTAÇÃO COMERCIAL: CAIXA INDIVIDUAL NO CALIBRE NÚMERO 15 COM NO MÍNIMO  80 (OITENTA) PONTAS. MARCAS DE REFERENCIA: DENTSPLY E TANARI'},
    {CADUM:48531,NOME:'PONTA DE PAPEL ABSORVENTE PARA SECAGEM DE CANAIS RADICULARES, DE CONICIDADE .02, À BASE DE PAPEL FILTRO. APRESENTAÇÃO COMERCIAL: CAIXA INDIVIDUAL NO CALIBRE NÚMERO 20 COM NO MÍNIMO 80 (OITENTA) PONTAS. MARCAS DE REFERENCIA: DENTSPLY E TDK'},
    {CADUM:14695,NOME:'PONTAS DESCARTAVEIS PARA APLICACAO DE ADESIVO (MICROBRUSH), POTE COM 100'},
    {CADUM:42240,NOME:'PONTAS PARA ULTRASSOM UNIVERSAL PARA REMOCAO DE TARTARO EM TODAS AS SUPERFICIES DOS DENTES SUPRA E S'},
    {CADUM:14464,NOME:'PORTA AGULHA CASTROVIEJO 15CM, EM ACO INOX'},
    {CADUM:24234,NOME:'PORTA AGULHA MATHIEU 14 CM, EM ACO INOX'},
    {CADUM:14465,NOME:'PORTA AGULHA MATHIEU 17 CM, EM ACO INOX'},
    {CADUM:7357,NOME:'PORTA AGULHA MAYO HEGAR 14 CM'},
    {CADUM:3098,NOME:'PORTA AGULHA MAYO HEGAR 15CM'},
    {CADUM:3099,NOME:'PORTA AGULHA MAYO HEGAR 16 CM'},
    {CADUM:7881,NOME:'PORTA AGULHA MAYO HEGAR 18CM'},
    {CADUM:6885,NOME:'PORTA AGULHA MAYO HEGAR 20CM'},
    {CADUM:14466,NOME:'PORTA ALGODAO COM MOLA, EM ACO INOX'},
    {CADUM:14467,NOME:'PORTA AMALGAMA, EM PLASTICO AUTOCLAVAVEL'},
    {CADUM:47234,NOME:'PORTA DETRITOS ODONTOLOGICO EM ACO INOX - DIMENSOE'},
    {CADUM:14470,NOME:'PORTA MATRIZ TIPO TOFFLEMIRE ADULTO, EM ACO INOX'},
    {CADUM:14471,NOME:'PORTA MATRIZ TIPO TOFFLEMIRE INFANTIL, EM ACO INOX'},
    {CADUM:35062,NOME:'POSICIONADOR RADIOGRÁFICO PARA ENDODONTIA, INDICADO PARA TOMADAS RADIOGRÁFICAS PELA TÉCNICA DO PARALELISMO, AUTOCLAVÁVEL, KIT TAMANHO ADULTO, CONTENDO 1 POSICIONADOR RADIOGRÁFICO PARA MOLARES, PRÉ-MOLARES E DENTES ANTERIORES SUPERIORES DO LADO ESQUERDO E MOLARES, PRÉ-MOLARES E DENTES ANTERIORES DO LADO DIREITO; 1 POSICIONADOR RADIOGRÁFICOS PARA MOLARES, PRÉ-MOLARES E DENTES ANTERIORES E SUPERIORES DO LADO DIREITO E MOLARES, PRÉ-MOLARES E DENTES ANTERIORES INFERIORES DO LADO ESQUERDO, MORDEDOR DE SILICONE.'},
    {CADUM:14473,NOME:'POTE DAPPEN DE PLASTICO'},
    {CADUM:14474,NOME:'POTE DAPPEN DE VIDRO. MEDIDAS APROXIMADAS: ALTURA 3CM, CONCAVIDADESUPERIOR 2,5 CM- CAPACIDADE MAXIMA 3ML, CONCAVIDADE INFERIOR 2CM- CAPACIDADE MAXIMA 2ML'},
    {CADUM:42727,NOME:'RAIO X ODONTOLOGICO, CONFORME PARECER DA ENGENHARIA CLINICA.'},
    {CADUM:17148,NOME:'REFIL PARA TAMBOREL PEQUENO DE ALUMINIO (TAMANHO PADRAO), PACOTE COM 50 UNIDADES '},
    {CADUM:14476,NOME:'REGUA MILIMETRADA ENDODONTICA METALICA'},
    {CADUM:42605,NOME:'REMOVEDOR DE MANCHAS, FRASCO COM 30 ML'},
    {CADUM:42787,NOME:'REMOVEDOR DE USO ODONTOLOGICO A BASE DE EUCALIPTOL, C10H180, 154,25 G/MOL, MINIMO DE 99%, CAS 470-82-6. VALIDADE DE 02 ANOS, FRASCO 10 ML'},
    {CADUM:44863,NOME:'RESINA RESTAURADORA NANO/MICROHIBRIDA DE MATRIZ MONOMERICA, NA COR DA1'},
    {CADUM:44864,NOME:'RESINA RESTAURADORA NANO/MICROHIBRIDA DE MATRIZ MONOMERICA, NA COR DA2'},
    {CADUM:44865,NOME:'RESINA RESTAURADORA NANO/MICROHIBRIDA DE MATRIZ MONOMERICA, NA COR DA3'},
    {CADUM:44860,NOME:'RESINA RESTAURADORA NANO/MICROHIBRIDA DE MATRIZ MONOMERICA, NA COR EA1'},
    {CADUM:44861,NOME:'RESINA RESTAURADORA NANO/MICROHIBRIDA DE MATRIZ MONOMERICA, NA COR EA2'},
    {CADUM:44862,NOME:'RESINA RESTAURADORA NANO/MICROHIBRIDA DE MATRIZ MONOMERICA, NA COR EA3'},
    {CADUM:44931,NOME:'RESINA RESTAURADORA NANO/MICROHIBRIDA DE MATRIZ MONOMERICA, NA COR EA3,5'},
    {CADUM:44866,NOME:'RESINA RESTAURADORA NANO/MICROHIBRIDA DE MATRIZ MONOMERICA, NA COR EB2'},
    {CADUM:14478,NOME:'SACA-BROCA UNIVERSAL'},
    {CADUM:39639,NOME:'SELADORA ACIONAMENTO ELETRONICO PARA PAPEL GRAU CIRURGICO. CONFORME PA'},
    {CADUM:33340,NOME:'SELADORA CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:45632,NOME:'SELADORA DE GRAU CIRURGICO CONFORME PARECER DA ENGENHARIA CLINICA'},
    {CADUM:42619,NOME:'SELANTE FOTOPOLIMERIZAVEL PARA CICATRICULAS E FISSURAS COM LIBERACAO DE FLUOR OPACO E COM CARGA, EM'},
    {CADUM:23947,NOME:'SERINGA CARPULE DOBRAVEL, EM ACO INOX'},
    {CADUM:63,NOME:'SERINGA DE VIDRO REUTILIZAVEL 5ML'},
    {CADUM:299,NOME:'SERINGA ENDODONTICA DE INOX'},
    {CADUM:14482,NOME:'SINDESMOTOMO'},
    {CADUM:30563,NOME:'SOLUCAO BUCAL A BASE DE GLUCONATO DE CLOREXIDINA A 0,12% SEM ALCOOL, FRASCO COM 250ML'},
    {CADUM:44839,NOME:'SOLUCAO BUCAL A BASE DE GLUCONATO DE CLOREXIDINA A 2 %, SEM ALCOOL, FRASCO COM 100ML'},
    {CADUM:42263,NOME:'SOLUCAO CARIOSTATICA DE DIAMINO FLUORETO DE PRATA A 30% EM MEIO AMONIACAL, FRASCO COM 05 ML.'},
    {CADUM:43789,NOME:'SOLUÇÃO DE HIPOCLORITO DE SODIO A 205%- SODA CLORADA- VAL 6 MESES'},
    {CADUM:12913,NOME:'SOLUCAO DE HIPOCLORITO DE SODIO A 4% - SODA CLORADA'},
    {CADUM:42617,NOME:'SOLUCAO EVIDENCIADORA DE PLACA BACTERIANA, CONTENDO FUCSINA BASICA, FRASCO 10 ML'},
    {CADUM:42600,NOME:'SOLUCAO FIXADORA RADIOGRAFICA, FRASCO 475ML'},
    {CADUM:14671,NOME:'SOLUCAO FIXADORA RADIOGRAFICA, FRASCO 475ML '},
    {CADUM:17092,NOME:'SOLUCAO HEMOSTATICA TOPICA COMPOSTA DE CLORETO DE ALUMINIO; SULFATO DE HIDROXIQUINOLEINA E ALUMINIO;'},
    {CADUM:42601,NOME:'SOLUCAO REVELADORA RADIOGRAFICA, FRASCO 475ML'},
    {CADUM:14672,NOME:'SOLUCAO REVELADORA RADIOGRAFICA, FRASCO 475ML'},
    {CADUM:14483,NOME:'SONDA EXPLORADORA DUPLA, EM ACO INOX'},
    {CADUM:14484,NOME:'SONDA EXPLORADORA MODIFICADA DUPLA, EM ACO INOX'},
    {CADUM:14486,NOME:'SONDA PERIODONTAL MILIMETRADA PCP 12, MODELO DA UNIVERSIDADE CAROLINA DO NORTE, EM ACO INOX'},
    {CADUM:17111,NOME:'SONDA PERIODONTAL MILIMETRADA TIPO NABERS OU SIMILAR, EM AÇO INOX, COM MARCAÇÕES PRECISAS EM 3MM, 6MM, 9 MM E 12 MM'},
    {CADUM:35064,NOME:'SPRAY PARA TESTE DE VITALIDADE PULPAR, FRASCO COM 200 ML'},
    {CADUM:14488,NOME:'SUGADOR CIRURGICO ESTERELIZADOS INDIVIDUALMENTE, CAIXA CONTENDO 20 UNIDADES'},
    {CADUM:31739,NOME:'SUGADOR DE SALIVA DESCARTAVEL, PRODUZIDO EM PVC, TRANSPARENTE E ATOXICO, EMBALAGEM COM 40'},
    {CADUM:46993,NOME:'SUGADOR ENDODÔNTICO DESCARTÁVEL CONFECCIONADO EM PVC , ATÓXICO, COLORIDO. EMBALAGEM COM 20 UNIDADES.'},
    {CADUM:12946,NOME:'TACA DE BORRACHA PARA PROFILAXIA, PARA CONTRA-ANGULO.'},
    {CADUM:31769,NOME:'TAMBOREL DE ALUMINIO PARA LIMAS ENDODONTICAS.'},
    {CADUM:14490,NOME:'TESOURA CASTROVIEJO CURVA 14 CM, EM ACO INOX'},
    {CADUM:30838,NOME:'TESOURA DE IRIS RETA 11,5CM, CONFECCIONADA EM ACO INOXIDAVEL.'},
    {CADUM:28720,NOME:'TESOURA DE METZENBAUM DE 20CM CURVA ACO INOX'},
    {CADUM:14493,NOME:'TESOURA GOLDMAN FOX CURVA, EM ACO INOX'},
    {CADUM:14494,NOME:'TESOURA GOLDMAN FOX RETA, EM ACO INOX'},
    {CADUM:28608,NOME:'TESOURA IRIS CURVA 11,5CM, CONFECCIONADA EM ACO INOXIDAVEL'},
    {CADUM:17106,NOME:'TESOURA IRIS CURVA DE 11 CM'},
    {CADUM:17102,NOME:'TESOURA IRIS RETA DE 11 CM'},
    {CADUM:17103,NOME:'TESOURA JOSEPH RETA DE 14 CM'},
    {CADUM:44724,NOME:'TESOURA METZEMBAUM RETA 20CM'},
    {CADUM:14495,NOME:'TESOURA RETA GRANDE DE 20 CM, EM ACO INOX'},
    {CADUM:42785,NOME:'TIRA DE ACO ABRASIVA PARA AMALGAMA (LIXA DE ACO) MONOFACE EM 4MM. CAIXA C/12 TIRAS - VALIDADE 03 ANO'},
    {CADUM:12949,NOME:'TIRA DE LIXA PARA POLIMENTO E ACABAMENTO DENTAL 4X170 MM, CAIXA COM 150 TIRAS'},
    {CADUM:42786,NOME:'TIRA DE POLIESTER DE 100X10X0,05MM - VALIDADE - 03 ANOS - CAIXA COM 50 TIRAS.'},
    {CADUM:42615,NOME:'TRICRESOLFORMALINA, VALIDADE 02 ANOS, FRASCO COM 10 ML'},
    {CADUM:44791,NOME:'VASELINA SOLIDA- TUBO COM 25 G'},								
]