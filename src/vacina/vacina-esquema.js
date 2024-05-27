window.onload = () => {
    if (typeof sessionStorage.getItem('esquema-vacina') !== "string")
        getLista();
    else 
        dataHtml(JSON.parse(sessionStorage.getItem('esquema-vacina')));
        // createTableElementWithData(JSON.parse(sessionStorage.getItem('esquema-vacina')));  
        console.log(JSON.parse(sessionStorage.getItem('esquema-vacina')));
}

function dataHtml(data) {
    // createCardsHtml(data);
    // createTableElementWithData(data);
    createPopoverList(data);
    document.getElementById('atualizar').disabled = false;
}

async function getLista() {
    const res = await fetch('https://script.google.com/macros/s/AKfycbyLuUjtOp2eFEB34iHwptYnLgTfEDceyYAeetdSpNAFXtXLZcX-PDVy90iQElM40YQwjw/exec?action=read');
    const data = await res.json();
    sessionStorage.setItem("esquema-vacina", JSON.stringify(data.content));
    const nowDate = new Date();
    document.getElementById('updatePage').innerHTML = `${nowDate.toLocaleDateString()} ${nowDate.toLocaleTimeString()}`;
    dataHtml(data.content);
    // createTableElementWithData(data.content);
}

function atualizar(){
    document.getElementById('atualizar').disabled = true;
    getLista();
    resetarSelectIdade();
    document.querySelector('#selectIdade').classList.add('d__none');
    document.querySelector("#divTitleFaixa").innerHTML = "Todos";
}

function createCardsHtml(lista) {    
    let cards = [];
    cards.push('<hr><h5>Detalhes</h5>')
    lista.forEach(e => {
        let elCard = `
        <div class="div__card">
            <div style="font-size: xx-small; color: darkgrey;">cod: ${e.id}</div>                        
            <div style="font-weight: 600;">${e.vacina}</div>
            <div>${e.vacina_sigla}</div>
            <div>${e.dose}</div>
            <div class="text-success">Fase: ${e.faixa}</div>
            <div style="display: flex;">
                <div>Idade inicial:</div>
                <div class="mx-2">ANO: ${e.idade_ano_minimo}</div>
                <div>Mes: ${e.idade_mes_minimo}</div>
            </div>        
            <div>${e.grupo}</div>
            <div>${e.observacao}</div>
            <div>${e.informacoes_complementares}</div>
            <div><small>${e.via_de_administracao}</small></div>
            <div><small>${e.local_de_administracao}</small></div>
            <div>${e.lote}</div>       
            <div>${e.validade}</div>            
        </div>
        `
        cards.push(elCard);
    });
    document.getElementById('card').innerHTML = cards.join('');    
}

function createPopoverList(lista) {
    let list = [];
    lista.forEach(e =>{
        let el = `
        <a tabindex="0"
            class="btn btn-sm btn-outline my-1 btn__${e.id.toString().substr(0,1)}"
            data-bs-toggle="popover"
            data-bs-title="${e.vacina}  ${e.dose}"
            data-bs-html="true"
            data-bs-trigger="focus" 
            data-bs-content="
                <div>
                    <div>
                        <span><strong>Observação:</strong> ${e.observacao}</span>                    
                    </div>                 
                    <div>                    
                        <span><strong>Informacões complementares:</strong> ${e.informacoes_complementares}</span>
                    </div>  
                    <div>
                        <strong> Via:</strong> ${e.via_de_administracao}
                    </div>
                    <div>
                        <strong>Local:</strong> ${e.local_de_administracao}
                    </div>
                    <div>
                        ${e.lote}
                    </div>
                    <div>
                       ${e.validade}
                    </div>                                 
                </div>">
            ${e.vacina} | ${e.dose}
        </a>
        `
        list.push(el);
    });
    document.getElementById('listVacinaSimplificada').innerHTML = list.join('');
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
}


document.querySelector('.button-container').addEventListener('click', (e) =>{
    document.querySelector('#selectIdade').classList.add('d__none');
    resetarSelectIdade();
    if(e.target.tagName === 'BUTTON') {
        document.querySelector("#divTitleFaixa").innerHTML = e.target.value;
        document.getElementById('container').innerHTML = "";
        if(e.target.value === 'Todos') {
            dataHtml(JSON.parse(sessionStorage.getItem('esquema-vacina')));
        }
        if(e.target.value !== 'Todos' && e.target.value !== 'Criança' ){
            const result = filtarLista(JSON.parse(sessionStorage.getItem('esquema-vacina')), e.target.value);
            dataHtml(result);
        }
        if (e.target.value === "Criança"){
            document.getElementById('listVacinaSimplificada').innerHTML = '';
            const result = filtarLista(JSON.parse(sessionStorage.getItem('esquema-vacina')), e.target.value);
            const group = groupBy(result, "grupo");
            console.log(group);
            const sortGroup = sortGroupsByName(group);
            listItems(sortGroup);
            document.querySelector('#selectIdade').classList.remove('d__none');
        }
    }
})

function filtarLista(lista, objFiltro){
    return lista.filter(obj => obj.faixa === objFiltro);
}

document.getElementById('idade').addEventListener('change', (e) =>{    
    const result = filtarLista(JSON.parse(sessionStorage.getItem('esquema-vacina')), 'Criança');
    const resultIdade = selectVacinaDaIdade(result, e.target.value);
    dataHtml(resultIdade);
})

function selectVacinaDaIdade(lista, filtro) {
    const idade = filtro.split(',');
    const ano = parseInt(idade[0])
    const mes = parseInt(idade[1]);
    const res = lista.filter(obj => obj.idade_ano_minimo === ano && obj.idade_mes_minimo === mes);
    return res;
}

function resetarSelectIdade() {
    const selectElement = document.getElementById('idade');
    selectElement.value = "-";
}

function groupBy(array, key) {
    return array
      .reduce((hash, obj) => {
        if(obj[key] === undefined) return hash; 
        return Object.assign(hash, { [obj[key]]:( hash[obj[key]] || [] ).concat(obj)})
      }, {})
 }

 function sortGroupsByName(groupedObj) {
    // Converte o objeto em um array de [chave, valor]
    let groupedArray = Object.entries(groupedObj);

    // Ordena o array com base no nome das chaves (grupos)
    groupedArray.sort((a, b) => a[0].localeCompare(b[0]));

    // Converte de volta para um objeto
    let sortedGroupedObj = Object.fromEntries(groupedArray);

    return sortedGroupedObj;
}

 function listItems(array) {
    const container = document.getElementById('container');
    container.classList.add('mt-5');

    for (const key in array) {
        if (array.hasOwnProperty(key)) {
            const items = array[key];

            const section = document.createElement('div');

            const parts = key.split(',');
            const ano = parseInt(parts[0], 10);
            const mes = parseInt(parts[1], 10);

            if(ano === 0)
                section.innerHTML = `<h6>${mes} Meses</h6>`;
            if(ano !== 0)
                section.innerHTML = `<h6>${ano} Ano(s) e ${mes} Mês(es)</h6>`;

            const ul = document.createElement('div');
            ul.className = 'mb-3'

            items.forEach((obj) => {
                const li = document.createElement('div');
                li.className = "";
                li.innerHTML = createPopoverObj(obj);
                ul.appendChild(li);
                const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
                const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
            });

            section.appendChild(ul);
            container.appendChild(section);
        }
    }
}

function createPopoverObj(e) {    
    return `
        <a tabindex="0"
            class="btn btn-sm btn-outline my-1 btn__${e.id.toString().substr(0,1)}"
            data-bs-toggle="popover"
            data-bs-title="${e.vacina}  ${e.dose}"
            data-bs-html="true"
            data-bs-trigger="focus" 
            data-bs-content="
                <div>
                    <div>
                        <span><strong>Observação:</strong> ${e.observacao}</span>                    
                    </div>                 
                    <div>                    
                        <span><strong>Informacões complementares:</strong> ${e.informacoes_complementares}</span>
                    </div>  
                    <div>
                        <strong> Via:</strong> ${e.via_de_administracao}
                    </div>
                    <div>
                        <strong>Local:</strong> ${e.local_de_administracao}
                    </div>
                    <div>
                        ${e.lote}
                    </div>
                    <div>
                       ${e.validade}
                    </div>                                 
                </div>">
            ${e.vacina} | ${e.dose}
        </a>
        `
}

function createTableElementWithData(data) {
    let table = document.createElement("table");
    table.id = "productTable";
    table.className = "table table-bordered table-striped";
    table.setAttribute('data-page-length', '100');
    table.setAttribute('data-order', '[[0, "asc"]]');

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
    th2.textContent = 'VACINA';
    th3.textContent = 'DOSE';
    th4.textContent = 'ANO,MÊS';
    th5.textContent = 'LOCAL DE ADMINISTRAÇÃO';
    th6.textContent = 'VIA DE ADMINISTRAÇÃO';
    th7.textContent = 'OBSERVAÇÃO';
    th7.className = "wide-column";
    th8.textContent = 'INFORMAÇÕES COMPLEMENTARES';
    th9.textContent = 'FAIXA';
    th10.textContent = 'VACINA SIGLA';

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
        tabCell.innerHTML = data[i].id;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data[i].vacina;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data[i].dose;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data[i].grupo;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data[i].local_de_administracao;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data[i].via_de_administracao;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data[i].observacao;
        tabCell.className = "wide-column";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data[i].informacoes_complementares;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data[i].faixa;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data[i].vacina_sigla;
        
    }

    table.appendChild(tbody);

    let divContainer = document.getElementById("showDataInTable");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);    

    
    $("#response").css("visibility", "visible");

    if ($.fn.DataTable.isDataTable('#productTable')) {
        $('#productTable').DataTable().destroy();
    }

    $(document).ready(function () {
        $('#productTable').DataTable({
            responsive: true,
            rowReorder: {
            selector: 'td:nth-child(1)'
            },
            scrollY: 600,
            "aaSorting": [],
            "search": {
                "search": ""
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
            },         
        });
    });      
}
