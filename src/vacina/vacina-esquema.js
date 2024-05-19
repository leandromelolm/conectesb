window.onload = () => {
    if (typeof sessionStorage.getItem('esquema-vacina') !== "string")
        getLista();
    else        
        createCardsHtml(JSON.parse(sessionStorage.getItem('esquema-vacina')));
}

async function getLista() {
    const res = await fetch('https://script.google.com/macros/s/AKfycbyLuUjtOp2eFEB34iHwptYnLgTfEDceyYAeetdSpNAFXtXLZcX-PDVy90iQElM40YQwjw/exec?action=read');
    const data = await res.json();
    sessionStorage.setItem("esquema-vacina", JSON.stringify(data.content));
    const nowDate = new Date();
    document.getElementById('updatePage').innerHTML = `${nowDate.toLocaleDateString()} ${nowDate.toLocaleTimeString()}`;
    createCardsHtml(data.content);
}

function atualizar(){
    document.getElementById('atualizar').disabled = true;
    getLista();
    resetarSelectIdade();
    document.querySelector('#selectIdade').classList.add('d__none');
    document.querySelector("#divTitleFaixa").innerHTML = "Todos";
}

function createCardsHtml(lista) {
    createPopover(lista);
    let cards = [];
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
    document.getElementById('atualizar').disabled = false;
}

function createPopover(lista) {
    let list = [];
    lista.forEach(e =>{
        let el = `
        <a tabindex="0" 
            class="btn btn-sm btn-outline-primary my-1" 
            role="button" 
            data-bs-toggle="popover" 
            data-bs-trigger="focus" 
            data-bs-title="Administração" 
            data-bs-content=" ${e.via_de_administracao} | ${e.local_de_administracao}">
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
        if(e.target.value === 'Todos') {
            createCardsHtml(JSON.parse(sessionStorage.getItem('esquema-vacina')));
        }
        if(e.target.value !== 'Todos'){
            const result = filtarLista(JSON.parse(sessionStorage.getItem('esquema-vacina')), e.target.value);
            createCardsHtml(result);            
            if (e.target.value === "Criança")
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
    createCardsHtml(resultIdade);
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