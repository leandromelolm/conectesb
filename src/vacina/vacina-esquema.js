let esquema_vacina;
window.onload = () => {
    esquema_vacina = sessionStorage.getItem('esquema-vacina');    
    if (typeof esquema_vacina !== "string")
        getLista();
    else        
        createCardsHtml(JSON.parse(esquema_vacina));
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
}

function createCardsHtml(lista) {
    let cards = [];
    lista.forEach(e => {
        let elCard = `
        <div class="div__card">
            <div>Fase: ${e.faixa}</div>
            <div style="font-size: xx-small;">
                <div>${e.id}</div>                        
            </div>
            <div>${e.vacina}</div>
            <div>${e.vacina_sigla}</div>
            <div>${e.dose}</div>
            <div style="display: flex;">
                Faixa etária inicial:
                <div style='margin: 0px 10px;'>ANO: ${e.idade_ano_minimo}</div>
                <div>Mes: ${e.idade_mes_minimo}</div>
            </div>        
            <div>${e.grupo}</div>
            <div>${e.observacao}</div>
            <div>${e.informacoes_complementares}</div>
            <div>${e.via_de_administracao}</div>
            <div>${e.local_de_administracao}</div>
            <div>${e.lote}</div>       
            <div>${e.validade}</div>       
        </div>
        `
        cards.push(elCard);
    });
    document.getElementById('card').innerHTML = cards.join('');
    document.getElementById('atualizar').disabled = false;
}

document.querySelector('.button-container').addEventListener('click', (e) =>{
    document.querySelector('#selectIdade').classList.add('d__none');
    resetarSelectIdade();
    if(e.target.tagName === 'BUTTON') {
        document.querySelector("#divTitleFaixa").innerHTML = e.target.value;
        if(e.target.value === 'Todos') {
            createCardsHtml(JSON.parse(esquema_vacina));
        }
        if(e.target.value !== 'Todos'){
            const result = filtarLista(JSON.parse(esquema_vacina), e.target.value);
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
    const result = filtarLista(JSON.parse(esquema_vacina), 'Criança');
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