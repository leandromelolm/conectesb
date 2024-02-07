let script_url = "https://script.google.com/macros/s/AKfycbwinNzlcMVLXIwArbLb7GHSVpptldKfFSAkX1fk5_j-QMqIEMyX0MiDGkLZYAFitY6YMQ/exec";

window.onload = () => {
    reload_data();
    document.getElementById("loadingSave").style.visibility = "hidden";
}

function salvar() {
    document.getElementById("loadingSave").style.visibility = "visible";
    let id = $("#id").val();
    if (id.length == 0) {
        insert_value();
    } else {
        update_value();
    }
}

async function insert_value() {
    load();
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
            document.getElementById("loadingSave").style.visibility = "hidden";
            closeModal();        
        }
    } catch (error) {
        console.log("erro ao inserir", error);
        reload_data()
    }
}

async function update_value() {
    $("#response").css("visibility", "hidden");
    document.getElementById("loader").style.visibility = "visible";
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
        document.getElementById("loadingSave").style.visibility = "hidden";
        closeModal();
    }
}

async function delete_value(id) {
    load();
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
    $("#response").css("visibility", "hidden");
    document.getElementById("loader").style.visibility = "visible";
    let url = script_url + "?action=read";

    $.getJSON(url, function (json) {

        let listItem = document.getElementById('listItem');
        let item = [];
        
        json.records.reverse();

        for (let i = 0; i < json.records.length; i++) {
            item.push(`            
            <span  class="list-group-item list-group-item-action" aria-current="true">                
                <div>
                    <div class="d-flex w-100 justify-content-between">
                        <div>
                            <h5 class="mb-1">${json.records[i].ITEM}</h5>
                            <div>
                                <small class="mb-1 text-black-50"> ${json.records[i].ID}</small>
                            </div>
                            <small class="mb-1">COD:${json.records[i].CODIGO} |</small>
                            <small class="mb-1">MARCA:${json.records[i].MARCA} </small>
                            <div class="mb-1">
                                <small>VALIDADE: ${formatDate(json.records[i].VALIDADE)}</small>
                            </div>
                            <div>
                                <button class="updateButton btn btn-outline-success" data-record='${JSON.stringify(json.records[i])}'>Editar</button>
                                <button class="btn btn-outline-danger" id="deleteButton_${json.records[i].ID}">Deletar</button>
                            </div>
                        </div>
                        <h3 class="d-flex align-items-center">${json.records[i].QUANTIDADE}</h3>
                    </div>
                </div>                
            </span>
            `);            
        };
        listItem.innerHTML = item.join('');
        
        document.getElementById("loader").style.visibility = "hidden";
        $("#response").css("visibility", "visible");
    });
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

function load() {
    $("#response").css("visibility", "hidden");
    document.getElementById("loader").style.visibility = "visible";
    $('#mySpinner').addClass('spinner');
}

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
    if (du < 120 && du > 0)
    return ` <b class="text-danger"> ${dt}. Próximo do vencimento: ${daysUntil(date)} dia(s) </b>`;
    if ( du < 0 )
    return `<b class="text-secondary"> ${dt}. item vencido </b>`;
}

function daysUntil(targetDate) {
    const target = new Date(targetDate);
    const today = new Date();
    const differenceInMilliseconds = target - today;
    const differenceInDays = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));
    return differenceInDays;
}

function responseMessage(data, op, typeAlert) {
    if (op === "deletado"){
        document.querySelector("#response").innerHTML = `
        <div class="alert alert-${typeAlert}" role="alert">
           Item ${op} com sucesso! Id: ${data.id}
        </div>
        `
    } else {
        document.querySelector("#response").innerHTML = `
        <div class="alert alert-${typeAlert}" role="alert">
           Item ${op} com sucesso! Id: ${data.id}. Instante: ${data.currentTime}
        </div>
        `
    }
}



// FUNÇÕES DE TESTE

async function insert_data_callback() {
    load();
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
    document.getElementById("loader").style.visibility = "visible";
    $('#mySpinner').addClass('spinner');
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
    document.getElementById("loader").style.visibility = "visible";
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
        document.getElementById("loader").style.visibility = "hidden";
        $("#response").css("visibility", "visible");
    });
}