let listaInventario = [];

window.addEventListener("DOMContentLoaded", () => {
    let listInventario = JSON.parse(localStorage.getItem('listInventario'));
    listaInventario = listInventario === null ? [] : listInventario;
    if (listaInventario.length > 0) {
        atualizarListaChamados();
        // esconderDivAddItensAoChamado();
    }
    if(localStorage.getItem('unidadeCall')) {
        document.getElementById('unidade').value = localStorage.getItem('unidadeCall');
    }
});

function adicionarItemAoChamado() {
    const equipamento = document.getElementById("equipamento").value; // equipamento => instrumental
    const quantidade = document.getElementById("quantidade").value;
    const observacao = document.getElementById("observacao").value;

    if (!equipamento) {
        document.getElementById("equipamento").focus();
        return alert (`O campo INSTRUMENTAL precisam ser preenchido.`);
    }

    const novoChamado = {
        item: listaInventario.length + 1,
        equipamento: equipamento.trim(),
        quantidade: quantidade.trim(),
        observacao: observacao.trim()
    };

    listaInventario.push(novoChamado);
    limparCamposItemDoChamado();
    atualizarListaChamados();
};

function limparCamposItemDoChamado() {
    document.getElementById("equipamento").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("observacao").value = "";    
};

function atualizarListaChamados() {
    const listaInventarioElement = document.getElementById("listaInventario");
    listaInventarioElement.innerHTML = "";

    // Iterar sobre a lista de trás para frente
    for (let index = listaInventario.length - 1; index >= 0; index--) {
        const inventario = listaInventario[index];

        const listItem = document.createElement("li");
        listItem.style.backgroundColor = "aliceblue";
        listItem.style.display = "flex";
        listItem.innerHTML += `
            <div style="align-self: center">        
                <button class="btn__remove_item" 
                    style="background-color: transparent"
                    data-index="${index}">
                    <img class="img__remove_item" src="assets/x-white.svg" alt="Remover">
                </button>
            </div>
            <div style="display: grid;">
                <div>
                    ${index + 1}. <strong>${inventario.equipamento}</strong>
                </div>
                <div>quantidade: <strong>${inventario.quantidade}</strong></div>
                <div>Observação: <strong>${inventario.observacao}</strong></div>
            </div>
        `;
        listaInventarioElement.appendChild(listItem);
    }
    saveCallListInLocalStorage(JSON.stringify(listaInventario));
    
    // ouvinte de evento de clique ao elemento pai (ul)
    listaInventarioElement.querySelectorAll(".btn__remove_item").forEach((btnRemover) => {
        btnRemover.addEventListener("click", (event) => {
            const index = btnRemover.getAttribute("data-index");
            removerItemChamado(index);
        });
    });
}


function removerItemChamado(index) {
    const parsedIndex = parseInt(index, 10);
    if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < listaInventario.length) {
        listaInventario.splice(parsedIndex, 1);
        atualizarListaChamados();
    }
};

function btnCancelAddItem() {
    limparCamposItemDoChamado();
    // esconderDivAddItensAoChamado();
};

function scrolldiv(elem) {
    var elem = document.getElementById(elem); 
    elem.scrollIntoView({block: "end", behavior: "smooth" }); 
};

function mostrarDivAddItensAoChamado() {
    document.getElementById("divAddItensAoChamado").classList.toggle("hidden", false);
    document.getElementById("btnMostrarFormulario").classList.toggle("hidden", true);
    scrolldiv("divAddItensAoChamado");
};

function esconderDivAddItensAoChamado() {
    document.getElementById("divAddItensAoChamado").classList.toggle("hidden", true);
    document.getElementById("btnMostrarFormulario").classList.toggle("hidden", false);
    scrolldiv("btnMostrarFormulario");
};

function saveUnidadeSolicitanteLocalStorage() {
    let unidade = document.getElementById("unidade").value;    
    localStorage.setItem("unidadeCall", unidade);
    restoreStyleBackgroundColor('unidade')
};

function restoreStyleBackgroundColor(elem) {
    document.getElementById(elem).style.backgroundColor = "white";
};

function saveCallListInLocalStorage(listaInventario){
    localStorage.setItem("listInventario", listaInventario);
};

function validarCamposUnidadeSolicitante() {
    const unidade = document.getElementById("unidade").value;
    const solicitante = document.getElementById("solicitante").value;
    if (unidade.trim() == "") {
        cursorFocus('unidade');
        return "Preencha o campo UNIDADE.";
    }
    if (!solicitante) {
        cursorFocus('solicitante');
        return "Preencha o campo FUNCIONÁRIO SOLICITANTE.";
    }
    if(!validarEmail()){
        return "O E-mail não foi preenchido corretamente";
    }
    if(listaInventario.length == 0){
        document.getElementById("addItem").focus();
        return `Adicione ao menos um item para o inventário.Preencha os campos de informação do item e clique em ADICIONAR ITEM.`;
    }    
    if(unidade.trim() !== "" && solicitante.trim() !== "") {
        return "OK";
    }
};

const cursorFocus = function(elem) {
    document.getElementById(elem).scrollIntoView({block: "end", behavior: 'smooth'});    
    document.getElementById(elem).style.backgroundColor = "antiquewhite";
    // document.getElementById(elem).focus(); // focus remove o efeito do scroll
};

function validarEmail() {
    const email = document.getElementById('email').value;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;    
    if (!regex.test(email) && email) {        
        alert('Endereço de e-mail inválido!');  
        scrolldiv("email");
        document.getElementById('email').style.backgroundColor = "antiquewhite";
        return false;
    } else {
        return true;
    }
};

function enviarChamado() {
    let validacaoCampos = validarCamposUnidadeSolicitante();
    if(validacaoCampos != "OK"){
        return alert(validacaoCampos);
    }    

    const unidade = document.getElementById("unidade").value;
    const solicitante = document.getElementById("solicitante").value;
    const email = document.getElementById("email").value;
    const quantidadeListaChamado = listaInventario.length;
    const dataChamado = dateFormat(new Date());

    const inventarioAberto = {
        unidade: unidade.toUpperCase().trim(),
        solicitante: solicitante.trim(),
        email: email.trim(),
        data: dataChamado,
        quantidadeListaChamado: quantidadeListaChamado,
        listaChamado: listaInventario
    };
    sendFetchSpreadSheet(inventarioAberto);
    // setTimeout(responseOKSubmitForm, 3000);
    // sendFetchEmail(inventarioAberto);
    // console.log("chAberto",inventarioAberto);
};

function sendFetchSpreadSheet(inventarioAberto) {
    mostrarMsgAguardeEnvio();
    let inventarioAbertoObj = inventarioAberto;
    inventarioAberto.listaChamado.forEach((inventario, index) => {
        objItemString = JSON.stringify(inventario)
        inventarioAberto.listaChamado[index] =  objItemString;    
    })
    objPedidoString = JSON.stringify(inventarioAberto);

    // INVENTÁRIO
    let url = "https://script.google.com/macros/s/AKfycbxLf3JIeePTrAPAoecYmnc1Bv0q6M09n6ah_gpadH1G_C0NNEgJPxOxqHiAJ8YWClVxIg/exec";
    fetch(url,{
        redirect: "follow",
        method: "POST",
        body: objPedidoString,
        headers: {
            "Content-Type": "text/plain;charset=utf-8",
        }
    })
    .then(response =>response.json())
    .then(data => responseMsgSentToSpreadSheet(data, inventarioAbertoObj))
    .catch(error => responseMsgSentToSpreadSheet(error, inventarioAbertoObj));
};

function responseMsgSentToSpreadSheet(data, inventarioAbertoObj) {
    console.log(data);
    removerMsgAguardarEnvio(); 
    let responseMsgSentToSpreadSheet = document.getElementById("responseMsgSentToSpreadSheet");
    if (data.status == "success") {
           
        responseMsgSentToSpreadSheet.classList.toggle('hidden', false)
        responseMsgSentToSpreadSheet.innerHTML = `
        <p><b>Invetário foi enviada e registrada com sucesso!</b></p> 
        <p>Id: ${data.content[0]}</p>  
        <p>Unidade: ${data.content[1]}</p> 
        <p>Data: ${data.content[4]}</p>       
        <p><a class="link-primary" href="inventario.html">fazer novo inventário</a></p>  
        <a class="link-primary" href="index.html">Voltar para o menu principal</a>
        `
        // sendFetchEmail(inventarioAbertoObj);
        localStorage.removeItem('listInventario'); 
    } else {
        responseMsgSentToSpreadSheet.classList.toggle('hidden', false)
        responseMsgSentToSpreadSheet.innerHTML = `
        Resposta: Erro no envio!        
        <p><a href="inventario.html">Tentar Novamente</a></p>  
        <a class="link-primary" href="index.html">Voltar para o menu principal</a>
        `        
    }
};

function mostrarMsgAguardeEnvio(){
    document.getElementById('spinner').className = "spinner-border"
    const mensagemAguarde = document.getElementById("mensagemAguarde");
    mensagemAguarde.style.display = "block";
    document.getElementById("inventarioForm").classList.toggle("hidden", true);
};

function removerMsgAguardarEnvio(){
    document.getElementById('spinner').className = "hidden"
    // document.getElementById("msgResponse").classList.toggle("hidden", false);
    const mensagemAguarde = document.getElementById("mensagemAguarde");
    mensagemAguarde.style.display = "block";
    mensagemAguarde.style.display = "none";
};

function sendFetchEmail(inventarioAbertoObj){
    mostrarMsgAguardeEnvio();
    let inventarioFormatado = {
        _subject: `INVENTÁRIO: ${inventarioAbertoObj.unidade} (DSV) - ${inventarioAbertoObj.data}`,
        _template : "box", // box ou table        
        unidade: inventarioAbertoObj.unidade,
        solicitante: inventarioAbertoObj.solicitante,
        data: inventarioAbertoObj.data,
        quantidade_de_itens_do_inventario: inventarioAbertoObj.quantidadeListaChamado,
    }
    if (inventarioAbertoObj.email){
        inventarioFormatado['_cc'] = inventarioAbertoObj.email;
    }

    inventarioAbertoObj.listaChamado.forEach((item, index) => {
        let inventario = JSON.parse(`${item}`);
        inventarioFormatado[`item_do_inventario_${index + 1}`] = `
INSTRUMENTAL: ${inventario.equipamento},
QUANTIDADE: ${inventario.quantidade},
OBSERVAÇÃO: ${inventario.observacao}
`;
    });

    let objPedidoString = JSON.stringify(inventarioFormatado);

    let urlSubmitEmail;
    // DEV
    let submitEmailTest = "https://formsubmit.co/ajax/cefa54954b23bf83a8eaef0881ced408";
    // PROD coord-sb-dsv
    let submitEmailProd = "https://formsubmit.co/ajax/491824f8b44b7c868c71bfcda5c0a842"
    
    const dominio = window.location.hostname;
    if (dominio === "conectesb.netlify.app" || dominio === "sbpedido.netlify.app") {
        urlSubmitEmail = submitEmailProd; 
    } else {
        urlSubmitEmail = submitEmailTest;        
    }

    fetch(urlSubmitEmail, {
        method: "POST",
        headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: objPedidoString
    })
    .then(response => response.json())
    .then(data => responseOKSubmitForm(data, inventarioFormatado))
    .catch(error => responseErrorSubmitForm(error));    
};

function responseOKSubmitForm(data, inventarioFormatado){    
    removerMsgAguardarEnvio();
    document.getElementById("msgResponse").classList.toggle("hidden", false);
    if(data.success == "true"){
        localStorage.removeItem('listInventario');
        document.getElementById('msgResponse').innerHTML = `
        <p><b>Um email foi enviado para coordenação de saúde bucal!</b></p> 
        Unidade: ${inventarioFormatado.unidade}
        <p>Data: ${inventarioFormatado.data}</p>        
        `;
        document.getElementById('msgResponse').style.background = '#4CB050';
        document.getElementById('msgResponse').style.color = 'white';
        console.log(data);
    } 
    if(inventarioFormatado._cc && data.success !== "true"){
        document.getElementById('msgResponse').innerHTML = `
        Algum problema aconteceu no envio do e-mail para a coordenação.
        messagem de erro: ${data.message}.
        <p>Se você preencheu o campo email, verifique se o email foi digitado corretamente.</p>
        Email preenchido no formulário: ${inventarioFormatado._cc}  
        <a href="index.html">Voltar para o menu principal</a>
        `;
        console.log(data);
    }    
    if (!inventarioFormatado._cc && data.success !== "true") {
        document.getElementById('msgResponse').innerHTML = `
        Erro no envio do email!.
        messagem de erro: ${data.message}.
        <a href="index.html">Voltar para o menu principal</a>
        `;
        console.log(data);
    }
};

function responseErrorSubmitForm(error){
    alert("Erro na Requisição: " + error)
    console.log(error);
    removerMsgAguardarEnvio();
    document.getElementById("msgResponse").classList.toggle("hidden", false);
    document.getElementById('msgResponse').innerHTML = `
    Erro no envio, Verifique a conexão da internet! 
    <p><a href="inventario.html">Tentar Novamente</a></p>    
    <a href="index.html">Voltar para o menu principal</a>
    `;
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

document.addEventListener('DOMContentLoaded', function() {
    let instrumentais = instrumentais_list;

    let dataList = document.getElementById('list-instrumental');

    instrumentais.forEach(function(instrumental) {
        let option = document.createElement('option');
        option.value = instrumental;
        dataList.appendChild(option);
    });

    // Iniciar o plugin de autocomplete
    // document.getElementById("equipamento").autocomplete();
});


let instrumentais_list = [
    "alavanca apical",
    "alavanca apical biselada nr 303",
    "alavanca seldin (bandeira)",
    "alavanca seldin (bandeira reta)",
    "alavanca seldin (bandeira par)",
    "alveolotomo curvo tipo luer",
    "alveolotomo reto",
    "aplicador de ionomero de vidro em capsula riva",
    "aplicador porta dycal duplo",
    "arco de young, em plastico",
    "arco ostby adulto para isolamento absoluto",
    "arco ostby adulto para isolamento absoluto",
    "arco ostby infantil para isolamento absoluto",
    "bandeja inox 22x09x1,5",
    "bandeja inox retangular pequena 30x20x4 cm",
    "brunidor ovoide para amalgama n 34",
    "brunidor ovoide para amalgama nº29",
    "cabo de bisturi tipo bard parker nº 3",
    "cabo para espelho bucal nº5",
    "espelho bucal nº 5",
    "caixa em aco inox com tampa e alca 32x22x06cm",
    "caixa em aco inox para endodontia com 36 furos",
    "caixa inox com tampa 18x08x03cm",
    "caixa inox com tampa 20x10x05",
    "caixa inox com tampa 25x10x05cm",
    "caixa inox com tampa 45 x 08 x 05cm",
    "calcador tipo paiva em aco inox  nº1",
    "calcador tipo paiva em aco inox nº2",
    "calcador tipo paiva em aco inox nº3",
    "calcador tipo paiva em aco inox nº4",
    "canula de succao metalica",
    "chave universal para ponta de ultrassom",
    "cinzel canelado (goiva ) 15 cm",
    "cinzel micro ochsenbein nº1",
    "cinzel micro ochsenbein nº2",
    "cinzel micro ochsenbein nº3",
    "cinzel reto biselado simples",
    "colgadura (prendedor para radiografia)",
    "condensador de ward para amalgama nº 1",
    "condensador de ward para amalgama nº2",
    "cuba redonda de aco inox de 8 cm",
    "cureta alveolar de lucas nº85",
    "cureta de gracey 11/12",
    "cureta de gracey 13/14",
    "cureta de gracey 7/8",
    "cureta de gracey 9/10",
    "cureta de mccall 13/14",
    "cureta de mccall 17/18.",
    "cureta de mccall 19/20",
    "cureta dentina nº14",
    "cureta dentina nº5",
    "cureta odontologica de gracey 5/6",
    "descolador de periosteo tipo molt",
    "esculpidor de hollemback nº3",
    "esculpidor de hollemback nº3s",
    "espatula em aco 24",
    "espatula em aco inox, nº70",
    "espatula em aco, nº31",
    "espatula lecron pequena",
    "espatula para resina titanio nº6",
    "estojo em inox 20x10x05cm estampado e perfurado",
    "foice nº0-00 (foice ponta morse 0-00)",
    "folder autoexame cancer de boca",
    "forceps adulto nº150",
    "forceps adulto nº151",
    "forceps adulto nº16",
    "forceps adulto nº17",
    "forceps adulto nº18l",
    "forceps adulto nº18r",
    "forceps adulto nº1",
    "forceps adulto nº65",
    "forceps adulto nº68",
    "forceps adulto nº69",
    "forceps infantil nº1",
    "forceps infantil nº5",
    "gengivotomo de kirkland",
    "gengivotomo de orban",
    "grampo nº201",
    "grampo nº202",
    "grampo nº203",
    "grampo nº204",
    "grampo nº205",
    "grampo nº206",
    "grampo nº207",
    "grampo nº208",
    "grampo nº209",
    "grampo nº210",
    "grampo nº211",
    "grampo nº212",
    "grampo nº26 especial",
    "grampo nºw8a",
    "grampo n° 203",
    "grampo para dique de borracha n° 210",
    "grampo para dique de borracha nºw8a especial",
    "grampo para dique em borracha nº200",
    "kit de aspiracao para endodontia",
    "martelo odontologico cirurgico",
    "oculos de protecao incolor em acrilico",
    "pinca crille curva 14cm",
    "pinca crille reta 14cm",
    "pinca crille reta 16cm",
    "pinca de allis 16cm",
    "pinca de collin reta 20 cm, com 2 dentes",
    "pinca de disseccao anatomica 14 cm com dente",
    "pinca de disseccao anatomica com dente 12cm",
    "pinca de disseccao anatomica com dente 16cm",
    "pinca de disseccao anatomica sem dente 14cm",
    "pinca de kelly 14cm curva",
    "pinca dente de rato 14cm",
    "pinca halstead mosquito curva 12",
    "pinca hemostatica mosquito curva 12 cm",
    "pinca hemostatica mosquito curva 14 cm",
    "pinca hemostatica mosquito reta 12 cm",
    "pinca hemostatica mosquito reta 14 cm",
    "pinca kelly reta 14cm",
    "pinca para algodao nº 17",
    "pinca porta grampo de brewer",
    "porta agulha mayo hegar 14 cm",
    "porta agulha mayo hegar 15cm",
    "porta agulha mayo hegar 16 cm",
    "porta agulha mayo hegar 18cm",
    "porta algodao com mola",
    "porta amalgama, em plastico autoclavavel",
    "porta detritos odontologico em aco inox - dimenssoe",
    "porta matriz tipo tofflemire adulto",
    "porta matriz tipo tofflemire infantil",
    "posicionador radiografico",
    "pote dappen, com tampa autoclavavel, tipo paladon, em vidro",
    "pote dappen de vidro",
    "refil para tamborel pequeno",
    "regua fina para raio-x",
    "regua milimetradade endodontica metalica",
    "saca-broca universal",
    "seringa carpule dobravel",
    "seringa endodontica de inox",
    "sindesmotomo",
    "sonda exploradora dupla",
    "sonda exploradora modificada dupla",
    "sonda periodontal milimetrada pcp 11.5",
    "sonda periodontal milimetrada pcp 12",
    "sonda tipo nabers para furca",
    "tesoura castroviejo curva 14 cm",
    "tesoura cirurgica reta, medindo 17 cm.",
    "tesoura de iris reta 11,5cm",
    "tesoura de metzenbaum de 20cm curva",
    "tesoura goldman fox curva",
    "tesoura goldman fox reta",
    "tesoura iris curva 11,5cm",
    "tesoura iris curva de 11 cm",
    "tesoura iris reta de 11 cm",
    "tesoura joseph reta de 14 cm",
    "tesoura metzembaum reta 20cm",
    "tesoura reta grande de 20 cm"
];