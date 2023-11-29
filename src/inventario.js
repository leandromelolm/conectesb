let listaInventario = [];

window.addEventListener("DOMContentLoaded", () => {
    let listInventario = JSON.parse(localStorage.getItem('listInventario'));
    listaInventario = listInventario === null ? [] : listInventario;
    if (listaInventario.length > 0) {
        atualizarListaChamados();
        esconderDivAddItensAoChamado();
    }
    if(localStorage.getItem('unidadeCall')) {
        document.getElementById('unidade').value = localStorage.getItem('unidadeCall');
    }
});

function adicionarItemAoChamado() {
    const equipamento = document.getElementById("equipamento").value;
    // const numeroSerie = document.getElementById("numero_serie").value;
    // const patrimonioTombamento = document.getElementById("patrimonio_tombamento").value;
    // const marca = document.getElementById("marca").value;
    // const modelo = document.getElementById("modelo").value;
    const observacao = document.getElementById("observacao").value;

    if (!equipamento) {
        document.getElementById("equipamento").focus();
        return alert (`O campo EQUIPAMENTO precisam ser preenchido.`);
    }
    // if (!numeroSerie && !patrimonioTombamento) {
    //     document.getElementById("numero_serie").focus();
    //     return alert (`É necessario preencher o campo NÚMERO DE SÉRIE ou NÚMERO DO PATRIMÓNIO`);
    // }
    // if (!observacao) {
    //     document.getElementById("observacao").focus();
    //     return alert (`O campo INFORME O PROBLEMA precisa ser preenchido.`);
    // }

    const novoChamado = {
        item: listaInventario.length + 1,
        equipamento: equipamento.trim(),
        // numero_serie: numeroSerie.trim(),
        // patrimonio_tombamento: patrimonioTombamento.trim(),
        // marca: marca.trim(),
        // modelo: modelo.trim(),
        observacao: observacao.trim()
    };

    listaInventario.push(novoChamado);
    limparCamposItemDoChamado();
    atualizarListaChamados();
    esconderDivAddItensAoChamado();
    window.scrollTo(0, 4000);
};

function limparCamposItemDoChamado() {
    document.getElementById("equipamento").value = "";
    // document.getElementById("numero_serie").value = "";
    // document.getElementById("patrimonio_tombamento").value = "";
    // document.getElementById("marca").value = "";
    // document.getElementById("modelo").value = "";
    document.getElementById("observacao").value = "";    
};

function atualizarListaChamados() {
    const listaInventarioElement = document.getElementById("listaInventario");
    listaInventarioElement.innerHTML = "";

    listaInventario.forEach((inventario, index) => {
        const listItem = document.createElement("li");
        listItem.style.backgroundColor = "aliceblue"
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
                ${index +1}. <strong>${inventario.equipamento}</strong>
            </div>
            <div>Problema: <strong>${inventario.observacao}</strong></div>
        </div>
        `;
        listaInventarioElement.appendChild(listItem);        
    });
    
    saveCallListInLocalStorage(JSON.stringify(listaInventario));
    
    // ouvinte de evento de clique ao elemento pai (ul)
    listaInventarioElement.querySelectorAll(".btn__remove_item").forEach((btnRemover) => {
        btnRemover.addEventListener("click", (event) => {
            const index = btnRemover.getAttribute("data-index");
            removerItemChamado(index);
        });
    });
};

function removerItemChamado(index) {
    const parsedIndex = parseInt(index, 10);
    if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < listaInventario.length) {
        listaInventario.splice(parsedIndex, 1);
        atualizarListaChamados();
    }
};

function btnCancelAddItem() {
    limparCamposItemDoChamado();
    esconderDivAddItensAoChamado();
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
        return `Adicione ao menos um item para o iventário.Preencha os campos de informação do item e clique em ADICIONAR ITEM.`;
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
        sendFetchEmail(inventarioAbertoObj);
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


/*

    inventarioAbertoObj.listaChamado.forEach((item, index) => {
        let inventario = JSON.parse(`${item}`);
        inventarioFormatado[`item_do_inventario_${index + 1}`] = `
EQUIPAMENTO: ${inventario.equipamento},
SÉRIE: ${inventario.numero_serie},
PATRIMÔNIO(TOMBAMENTO): ${inventario.patrimonio_tombamento}, 
MARCA: ${inventario.marca},
MODELO: ${inventario.modelo},
OBSERVAÇÃO: ${inventario.observacao}
`;
    });



*/

/*

function atualizarListaChamados() {
    const listaInventarioElement = document.getElementById("listaInventario");
    listaInventarioElement.innerHTML = "";

    listaInventario.forEach((inventario, index) => {
        const listItem = document.createElement("li");
        listItem.style.backgroundColor = "aliceblue"
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
                ${index +1}. <strong>${inventario.equipamento}</strong>
            </div>
            <div>Número de Série: <strong>${inventario.numero_serie}</strong></div>
            <div>Patrimônio: <strong>${inventario.patrimonio_tombamento}</strong></div>
            <div>Marca: <strong>${inventario.marca}</strong></div>
            <div>Modelo: <strong>${inventario.modelo}</strong></div>
            <div>Problema: <strong>${inventario.observacao}</strong></div>
        </div>
        `;
        listaInventarioElement.appendChild(listItem);        
    });


*/