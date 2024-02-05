let script_url = "https://script.google.com/macros/s/AKfycbwinNzlcMVLXIwArbLb7GHSVpptldKfFSAkX1fk5_j-QMqIEMyX0MiDGkLZYAFitY6YMQ/exec";

window.onload = () => {
    reload_data()
}

function salvar() {
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
    let item = $("#item").val();
    let marca = $("#marca").val();

    let validade = formatDate($("#validade").val());

    let quantidade = $("#quantidade").val();
    try {
        const res = await fetch(script_url + "?id=" + id + "&codigo=" + codigo + "&item=" + item + "&marca=" + marca + "&validade=" + "'" + validade + "&quantidade=" + quantidade + "&action=insert");
        if (res.ok) {
            const data = await res.json();
            console.log(data.content);
            reload_data();
            clear_form();
        }
    } catch (error) {
        console.log("erro ao inserir", error);
        reload_data()
    }
}

async function update_value() {
    $("#re").css("visibility", "hidden");
    document.getElementById("loader").style.visibility = "visible";
    let id1 = $("#id").val();
    let codigo = $("#codigo").val();
    let item = $("#item").val();
    let marca = $("#marca").val();
    let validade = formatDate($("#validade").val());
    let quantidade = $("#quantidade").val();
    let url = script_url + "?callback=ctrlq&codigo=" + codigo + "&item=" + item + "&marca=" + marca + "&validade=" + "'" + validade + "&quantidade=" + quantidade + "&id=" + id1 + "&action=update";

    const res = await fetch(url);

    if (res.ok) {
        reload_data();
        clear_form();
    }
}

async function delete_value(id) {
    load();
    try {
        const res = await fetch(script_url + "?callback=ctrlq&id=" + id + "&action=delete");
        console.log(res);
        if (res.ok) {
            reload_data();
        }
    } catch (error) {
        console.log("erro ao deletar", error);
    }
}

function read_value() {
    $("#re").css("visibility", "hidden");
    document.getElementById("loader").style.visibility = "visible";
    let url = script_url + "?action=read";

    $.getJSON(url, function (json) {

        let listItem = document.getElementById('listItem');
        let item = [];
        
        json.records.reverse();

        for (let i = 0; i < json.records.length; i++) {
            item.push(`            
            <a href="#" class="list-group-item list-group-item-action" aria-current="true">                
                <div>
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${json.records[i].ITEM}</h5>
                        <h3>${json.records[i].QUANTIDADE}</h3>
                    </div>
                    <p class="mb-1">${json.records[i].CODIGO} | Marca:${json.records[i].MARCA}</p>
                    <small> Validade: ${json.records[i].VALIDADE}</small>
                </div>
                <button class="updateButton btn btn-outline-success" data-record='${JSON.stringify(json.records[i])}'>Editar</button>
                <button class="btn btn-outline-danger" id="deleteButton_${json.records[i].ID}">Deletar</button>
            </a>
            `);            
        };
        listItem.innerHTML = item.join('');
        
        document.getElementById("loader").style.visibility = "hidden";
        $("#re").css("visibility", "visible");
    });
}

document.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('updateButton')) {
        const recordData = JSON.parse(event.target.dataset.record);
        preencherForm(recordData);
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
    $("#re").css("visibility", "hidden");
    document.getElementById("loader").style.visibility = "visible";
    $('#mySpinner').addClass('spinner');
}

function reload_data() {
    $("#re").css("visibility", "visible");
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
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
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
    $("#re").css("visibility", "hidden");
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
    $("#re").css("visibility", "hidden");
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
        $("#re").css("visibility", "visible");
    });
}