window.onload = () => {
    const esquema_vacina = sessionStorage.getItem('esquema-vacina');    
    if (typeof esquema_vacina !== "string")
        getLista();
    else        
        createCardsHtml(JSON.parse(esquema_vacina));
}

async function getLista() {
    const res = await fetch('https://script.google.com/macros/s/AKfycbyLuUjtOp2eFEB34iHwptYnLgTfEDceyYAeetdSpNAFXtXLZcX-PDVy90iQElM40YQwjw/exec?action=read');
    const data = await res.json();
    sessionStorage.setItem("esquema-vacina", JSON.stringify(data.content));
    createCardsHtml(data.content);
}

function atualizar(){
    document.getElementById('atualizar').disabled = true;
    getLista();
}

function createCardsHtml (lista) {
    console.log(lista);
    const nowDate = new Date();
    document.getElementById('updatePage').innerHTML = `${nowDate.toLocaleDateString()} ${nowDate.toLocaleTimeString()}`;
    let cards = [];
    lista.forEach(e => {
        let elCard = `
        <div style="margin: 10px; border: solid 1px;">
            <div style="display:flex;">
                <div>${e.id}</div>
                <div style="margin: 0px 10px;">Fase: ${e.faixa}</div>        
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