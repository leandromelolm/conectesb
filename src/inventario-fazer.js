let instrumentais_list = [];
let inventaryList = [];

window.addEventListener("DOMContentLoaded", () => {
    instrumentais_list;
    criarFormulario();
    carregarValoresSalvosNoLocalStorage();
    document.getElementById("btn-to-bottom").style.display = "block";
})

function criarFormulario() {
    const inventaryContainer = document.getElementById("inventaryContainer");

    const divHeader = document.createElement("div");
    divHeader.classList.add("inventary__header");
    divHeader.innerHTML = `
        <div class="d-flex justify-content-between">
            <div class="col-8 d-flex">
                <div id="headerItem">Item</div>
            </div>
            <div class="col-2 div__item">
                <div>Quantidade Estoque</div>
            </div>
            <div class="col-2 div__quant">
                <div>Quantidade Pedida</div>
            </div>
        </div>
    `;
    inventaryContainer.appendChild(divHeader);

    instrumentais_list.forEach((item, index) => {
        const divElement = document.createElement("div");
        divElement.classList.add("inventary__element");
        divElement.setAttribute("data-inventary", index + 1);

        const divInnerHtml = `           
            <div class="d-flex justify-content-between">
                <div class="col-8 d-flex">
                    <div id="item">${index + 1}. ${item}</div>
                </div>
                <div class="col-2 div__item">
                    <input type="number" id="quantEstoque${index}" min="0" max="300" class="input__item">
                </div>
                <div class="col-2 div__quant">
                    <input type="number" id="quantPedida${index}" min="0" max="300" class="input__quant">
                </div>
            </div>
        `;

        divElement.innerHTML = divInnerHtml;
        inventaryContainer.appendChild(divElement);
    });    
}

function validarFormulario(event) {
    'use strict';  
    var formulario = document.getElementById('inventarioForm');      
    if (formulario.checkValidity()) {
        console.log('Formulário válido. Executar função enviar...');
        event.preventDefault();
        document.getElementById("invalidForm").style.display = "none";    
        prepararParaEnviar();
    } else {
        document.getElementById("invalidForm").style.display = "block";
        console.log('Formulário inválido. Corrija os campos destacados.');
    }    
    formulario.classList.add('was-validated');
}

function validarEmail() {
    const email = document.getElementById('email').value;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;    
    if (!regex.test(email) && email) {   
        document.getElementById("invalidForm").style.display = "block"; 
        document.getElementById('email').style.borderColor = "#dc3545";
        scrolldiv("email");
        return false;
    } else {
        document.getElementById('email').style.borderColor = "#198754";
        document.getElementById("invalidForm").style.display = "none";
        return true;
    }
}

function scrolldiv(elem) {
    var elem = document.getElementById(elem); 
    elem.scrollIntoView({block: "end", behavior: "smooth" }); 
}

function prepararParaEnviar(){

    inventaryList = JSON.parse(localStorage.getItem("inventario_fazer_inventaryData"));

    const unidade = document.getElementById("unidade").value;
    const solicitante = document.getElementById("solicitante").value;
    const email = document.getElementById("email").value;
    const quantList = inventaryList.length;
    const dataInventario = dateFormat(new Date());
    const observacao = document.getElementById("observacao").value;

        const objInventario = {
        unidade: unidade.toUpperCase().trim(),
        solicitante: solicitante.trim(),
        email: email.trim(),
        data: dataInventario,
        quantidadeLista: quantList,
        listaInventario: localStorage.getItem("inventario_fazer_inventaryData"),
        observacao: observacao.trim()
    };
    // setTimeout(msgResponseSendToSheet('',''), 3000);
    sendSpreadSheet(objInventario);
}

document.getElementById('solicitante').addEventListener('input', function() {
    var campoValido = verificarLetraNoCampo();
    if (campoValido) {
        document.getElementById('solicitante').setCustomValidity('');
    } else {
        document.getElementById('solicitante').setCustomValidity('Por favor, preencha campo Funcionário corretamente.');
    }
});

function verificarLetraNoCampo() {
    var valorCampo = document.getElementById('solicitante').value;
    var contemLetra = /[a-zA-Z]/.test(valorCampo);
    // retorna true se houver alguma letra alfabetica no campo.
    return contemLetra;
}

function mostrarMsgAguardeEnvio(){
    document.getElementById('spinner').className = "spinner-border"
    const mensagemAguarde = document.getElementById("mensagemAguarde");
    mensagemAguarde.style.display = "block";
    document.getElementById("inventarioForm").classList.toggle("hidden", true);
}

function removerMsgAguardarEnvio(){
    // document.getElementById("msgResponse").classList.toggle("hidden", false);
    document.getElementById('spinner').className = "hidden"
    const mensagemAguarde = document.getElementById("mensagemAguarde");
    mensagemAguarde.style.display = "block";
    mensagemAguarde.style.display = "none";
}

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
}

function saveUnidadeSolicitanteLocalStorage() {
    localStorage.setItem("inventario_fazer_unidade", unidade.value);
    localStorage.setItem("inventario_fazer_observacao", observacao.value.trim())
}

function salvarItensNoLocalStorage() {
    const inventaryContainer = document.getElementById("inventaryContainer");
    const inputEstoqueList = inventaryContainer.querySelectorAll('[id^="quantEstoque"]');
    const inputPedidaList = inventaryContainer.querySelectorAll('[id^="quantPedida"]');

    const inventaryData = [];

    inputEstoqueList.forEach((inputEstoque, index) => {
        const item = {
            index: index + 1,
            descricao: instrumentais_list[index],
            quantEstoque: inputEstoque.value,
            quantPedida: inputPedidaList[index].value,
        };
        inventaryData.push(item);
    });
    localStorage.setItem('inventario_fazer_inventaryData', JSON.stringify(inventaryData));
}
document.getElementById("inventaryContainer").addEventListener("input", salvarItensNoLocalStorage);

function carregarValoresSalvosNoLocalStorage() {
    document.getElementById("unidade").value = localStorage.getItem('inventario_fazer_unidade');
    document.getElementById("observacao").value = localStorage.getItem('inventario_fazer_observacao');
    const inventarioDataString = localStorage.getItem('inventario_fazer_inventaryData');
    if (inventarioDataString) {
        let inventaryData = JSON.parse(inventarioDataString);
        inventaryList = inventaryData;
        const inventaryContainer = document.getElementById("inventaryContainer");
        const elements = inventaryContainer.querySelectorAll('.inventary__element');
        elements.forEach((element, index) => {
            const inputEstoque = element.querySelector('.div__item input[id^="quantEstoque"]');
            const inputPedida = element.querySelector('.div__quant input[id^="quantPedida"]');
            if (index < inventaryData.length) {
                if (inputEstoque) {
                    inputEstoque.value = inventaryData[index].quantEstoque;
                }
                if (inputPedida) {
                    inputPedida.value = inventaryData[index].quantPedida;
                }
            }
        });
    }
}

function sendSpreadSheet(objInventario) {
    mostrarMsgAguardeEnvio();
    
    let objInventarioStr = JSON.stringify(objInventario);

    let url = 'https://script.google.com/macros/s/AKfycbwFSFG79Sgu1P4HIO9kZ4huVb2FZOb38hvbsLhyJmrgPE7Pxx6GUERGCqphDcMRnnTqaA/exec';   
    fetch(url,{
        redirect: "follow",
        method: "POST",
        body: objInventarioStr,
        headers: {
            "Content-Type": "text/plain;charset=utf-8",
        }
    })
    .then(response =>response.json())
    .then(data => msgResponseSendToSheet(data, objInventario))
    .catch(error => msgErrorSentToSpreadSheet(error, objInventario));
}

function msgErrorSentToSpreadSheet(error) {
    console.log(error);
    removerMsgAguardarEnvio();
    document.querySelector('#msgResponseSendSheet').innerHTML = `
    <div class="alert alert-danger">
        <div class="d-block" role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:">
                <use xlink:href="./assets/check-circle-fill.svg#check-circle-fill"/>
            </svg>
            <div>
                <h5 class="alert-heading">Erro no Envio!</h5>
                <p>Menssagem do erro: ${error}</p>
            </div>
        </div>

        <div class="d-grid gap-3">
            <a href="inventario-lista?search=all" class="alert-link text-decoration-none">Ver lista de unidades que já enviaram o inventário</a>
            <a href="inventario-fazer.html" class="alert-link text-decoration-none">Tentar novamente</a>
            <a href="ndex.html" class="alert-link text-decoration-none">Voltar para o menu principal</a>
        </div>                    
    </div>
`
}

function msgResponseSendToSheet(data, objInventario) {
    console.log(data, objInventario);
    removerMsgAguardarEnvio();
    if (data.status == "success") {

        document.querySelector('#msgResponseSendSheet').innerHTML = `
        <div class="alert alert-success">
            <div class="d-block" role="alert">
                <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:">
                    <use xlink:href="./assets/check-circle-fill.svg#check-circle-fill"/>
                </svg>
                <div>
                    <h5 class="alert-heading">Inventário foi enviada e registrada com sucesso!</h5>
                </div>
            </div>                  
            <p><strong>Protocolo: </strong>${data.protocolo}</p>                    
            <p><strong>Unidade: </strong>${objInventario.unidade}</p> 
            <p><strong>Data:</strong> ${data.data}</p>       
            <hr>
            <div class="d-grid gap-3">
                <a href="inventario-lista?search=all" class="alert-link text-decoration-none">Ver lista de unidades que já enviaram o inventário</a>
                <a href="inventario-fazer.html" class="alert-link text-decoration-none">Fazer novo inventário</a>
                <a href="ndex.html" class="alert-link text-decoration-none">Voltar para o menu principal</a>
            </div>                    
        </div>
        `
        limparTudo();
    } else {
        document.querySelector('#msgResponseSendSheet').innerHTML = `
        <div class="alert alert-danger" role="alert">
            <h5 class="alert-heading">Erro no envio!</h5>
            <p><a href="inventario-fazer.html" class="alert-link text-decoration-none">Tentar Novamente</a></p>
            <p><a href="index.html" class="alert-link text-decoration-none">Voltar para o menu principal</a></p>
        </div>
        `
    }
}

function sendEmail(objInventario) {
    mostrarMsgAguardeEnvio();
    let inventorySendByEmail = {
        _subject: `INVENTÁRIO: ${objInventario.unidade} (DSV) - ${objInventario.data}`,
        _template : "box", // box ou table        
        unidade: objInventario.unidade,
        solicitante: objInventario.solicitante,
        data: objInventario.data,
        quantidade_de_itens_do_inventario: objInventario.quantidadeLista,
        observacao: objInventario.observacao
    }
    if (objInventario.email){
        inventorySendByEmail['_cc'] = objInventario.email;
    }

    let list_item = [];
    let item =` #. Descrição, Estoque, Pedido
        `;
    list_item.push(item);

    let list = JSON.parse(objInventario.listaInventario);

    list.forEach((i, index) => {
        let item =` ${i.index}. ${i.descricao}, ${i.quantEstoque}, ${i.quantPedida}
        `;
        list_item.push(item);
    });

    inventorySendByEmail['itens'] = list_item;

    let inventoryStr = JSON.stringify(inventorySendByEmail);

    let urlSubmitEmail;
    // DEV
    let submitEmailTest = "https://formsubmit.co/ajax/cefa54954b23bf83a8eaef0881ced408";
    // PROD coord-sb-dsv
    let submitEmailProd = "https://formsubmit.co/ajax/491824f8b44b7c868c71bfcda5c0a842";
    
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
        body: inventoryStr
    })
    .then(response => response.json())
    .then(data => responseSendEmail(data, objInventario))
    .catch(error => responseErrorSubmitForm(error));    

}

function responseSendEmail(data, objInventario){
    removerMsgAguardarEnvio();
    limparTudo();
    document.getElementById("msgResponse").classList.toggle("hidden", false);
    if(data.success == "true"){
        localStorage.removeItem('listInventario');
        document.getElementById('msgResponse').innerHTML = `
        <p><b>Um email foi enviado para coordenação de saúde bucal!</b></p> 
        Unidade: ${objInventario.unidade}
        <p>Data: ${objInventario.data}</p>        
        `;
        document.getElementById('msgResponse').style.background = '#4CB050';
        document.getElementById('msgResponse').style.color = 'white';
        console.log(data);
    } 
    if(objInventario._cc && data.success !== "true"){
        document.getElementById('msgResponse').innerHTML = `
        Algum problema aconteceu no envio do e-mail para a coordenação.
        messagem de erro: ${data.message}.
        <p>Se você preencheu o campo email, verifique se o email foi digitado corretamente.</p>
        Email preenchido no formulário: ${objInventario._cc}  
        <a href="index.html">Voltar para o menu principal</a>
        `;
        console.log(data);
    }    
    if (!objInventario._cc && data.success !== "true") {
        document.getElementById('msgResponse').innerHTML = `
        Erro no envio do email!.
        messagem de erro: ${data.message}.
        <a href="index.html">Voltar para o menu principal</a>
        `;
        console.log(data);
    }
}

function responseErrorSubmitForm(error){
    alert("Erro na Requisição: " + error)
    console.log(error);
    removerMsgAguardarEnvio();
    document.getElementById("msgResponse").classList.toggle("hidden", false);
    document.getElementById('msgResponse').innerHTML = `
    Erro no envio, Verifique a conexão da internet! 
    <p><a href="inventario-fazer.html">Tentar Novamente</a></p>    
    <a href="index.html">Voltar para o menu principal</a>
    `;
}

function btnLimparTodoFormulario() {
    if (
        confirm('Tem certeza? essa ação irá apagar todos os campos preenchidos.')
    ) {
        limparTudo();
    }
}

function limparTudo() {
    localStorage.removeItem('inventario_fazer_unidade');
    localStorage.removeItem('inventario_fazer_observacao');
    localStorage.removeItem('inventario_fazer_inventaryData');

    document.getElementById("unidade").value = '';
    document.getElementById("solicitante").value = '';
    document.getElementById("email").value = '';
    document.getElementById("observacao").value = '';
    limparCamposItensInventario();
}

function limparCamposItensInventario() {
    const inventaryContainer = document.getElementById("inventaryContainer");
    const camposDeInput = inventaryContainer.querySelectorAll('.input__item, .input__quant');

    camposDeInput.forEach((campo) => {
        campo.value = "";
    });
}

function criarTabelaInventario(objInventario) {
    const tabelaInventario = document.getElementById('tabelaInventario');
    tabelaInventario.innerHTML = '';
    const cabecalho = tabelaInventario.createTHead();
    const cabecalhoLinha = cabecalho.insertRow();
    const rotulos = ['Item', 'Descrição', 'Estoque', 'Pedido'];
    rotulos.forEach((rotulo) => {
        const th = document.createElement('th');
        th.textContent = rotulo;
        cabecalhoLinha.appendChild(th);
    });
    objInventario.listaInventario.forEach((item) => {
        const linha = tabelaInventario.insertRow();
        for (const chave in item) {
            const celula = linha.insertCell();
            celula.textContent = item[chave];
        }
    });
}

window.onscroll = function () {
  scrollFunctionToTop();
  scrollFunctionToBottom();
}

function scrollFunctionToTop() {
    if (
        document.body.scrollTop > 400 ||
        document.documentElement.scrollTop > 400
    ) {
        btnToTop.style.display = "block";
    } else {
        btnToTop.style.display = "none";
    }
}

function scrollFunctionToBottom() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const bottomThreshold = document.body.scrollHeight - window.innerHeight - 200;
    if (scrollPosition < bottomThreshold) {
        btnToBotton.style.display = "block";
    } else {
        btnToBotton.style.display = "none";
    }
}

let btnToTop = document.getElementById("btn-back-to-top");
btnToTop.addEventListener("click", backToTop);
function backToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

let btnToBotton = document.getElementById("btn-to-bottom");
btnToBotton.addEventListener("click", goToBottom);
function goToBottom() {
  document.body.scrollTop = document.body.scrollHeight;
  document.documentElement.scrollTop = document.documentElement.scrollHeight;
}


function autoComplete(unidade) {
    const destino = [
        'US 117 USF GASPAR REGUEIRA COSTA (BARRO)',
        'US 142 CS BIDU KRAUSE',
        'US 150 CS PROFESSOR FERNANDES FIGUEIRAS',
        'US 158 CS PAM CEASA',
        'US 161 CS PROF ROMERO MARQUES',
        'US 177 USF CHICO MENDES',
        'US 186 USF JARDIM UCHÔA',
        'US 238 USF IRAQUE',
        'US 239 USF COQUEIRAL I E II',
        'US 245 USF PLANETA DOS MACACOS II',
        'US 265 USF MANGUEIRA I',
        'US 266 USF MANGUEIRA II',
        'US 284 USF VILA SÃO MIGUEL MARROM GLACÊ',
        'US 294 USF VILA TAMANDARE BEIRINHA',
        'US 300 USF DR GERALDO B CAMPELO SAN MARTIN',
        'US 301 USF BONGI BOA IDEIA',
        'US 323 USF MUSTARDINHA',
        'US 338 USF JARDIM SÃO PAULO',
        'US 344 USF JIQUIÁ',
        'US 345 USF PLANETA DOS MACACOS I',
        'US 393 USF UPINHA DIA BONGI NOVO PRADO',
        'US 399 USF UPINHA DIA NOVO JIQUIÁ',
    ];
    return destino.filter((valor) => {
        const valorMinusculo = valor.toLowerCase()
        const unidadeMinusculo = unidade.toLowerCase()

        return valorMinusculo.includes(unidadeMinusculo)
    })
}

const input__unidade = document.querySelector('.input__unidade')
const options = document.querySelector('.options')

let selectedIndex = -1;

input__unidade.addEventListener('input', ({ target }) => {
    const dadosDoCampo = target.value;

    if (dadosDoCampo.length) {
        const autoCompleteValores = autoComplete(dadosDoCampo);

        options.innerHTML = `
            ${autoCompleteValores.map((value, index) => {
                return (
                    `<li>
                        <a onclick="preencherInput('${value}')">${value}</a>
                    </li>`
                );
            }).join('')}
        `;

        selectedIndex = -1;
    } else {
        options.innerHTML = '';
    }
});

input__unidade.addEventListener('keydown', (event) => {
    const items = options.querySelectorAll('li');

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
        preencherInput(items[selectedIndex].textContent);
    }
});

function updateSelectedIndex(items) {
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedIndex);
    });
}

function preencherInput(value) {
    document.getElementById('unidade').value = value.trim();
    options.innerHTML = '';
}

instrumentais_list = [
    "abaixador de língua de bruenings",
    "abridor de boca infantil plástico",
    "afastador cirúrgico de farabeuf adulto (par)",
    "afastador minessota inox",
    "alavanca de Seldin direita (bandeira)",
    "alavanca de Seldin esquerda (bandeira)",
    "alavanca de Seldin reta (bandeira)",
    "alavanca apical direita",
    "alavanca apical esquerda",
    "alavanca apical reta",    
    "alavanca apical biselada nr303",
    "alveolotomo curvo tipo luer",
    "alveolotomo reto",
    "aplicador de ionomero de vidro em capsula riva",
    "aplicador porta dycal duplo",
    "arco de young, em plastico",
    "arco ostby adulto para isolamento absoluto",
    "arco ostby infantil para isolamento absoluto",
    "bandeja inox 22x09x1,5",
    "bandeja inox retangular pequena 30x20x4cm",
    "brunidor ovoide para amalgama nº34",
    "brunidor ovoide para amalgama nº29",
    "cabo de bisturi tipo bard parker nº3",
    "cabo para espelho bucal nº5",
    "espelho bucal nº5",
    "caixa em aco inox com tampa e alca 32x22x06cm",
    "caixa em aco inox para endodontia com 36 furos",
    "caixa inox com tampa 18x08x03cm",
    "caixa inox com tampa 20x10x05cm",
    "caixa inox com tampa 25x10x05cm",
    "caixa inox com tampa 45 x 08 x 05cm",
    "calcador tipo paiva em aco inox nº1",
    "calcador tipo paiva em aco inox nº2",
    "calcador tipo paiva em aco inox nº3",
    "calcador tipo paiva em aco inox nº4",
    "canula de succao metalica",
    "chave universal para ponta de ultrassom",
    "cinzel canelado (goiva ) 15cm",
    "cinzel micro ochsenbein nº1",
    "cinzel micro ochsenbein nº2",
    "cinzel micro ochsenbein nº3",
    "cinzel reto biselado simples",
    "colgadura (prendedor para radiografia)",
    "condensador de ward para amalgama nº1",
    "condensador de ward para amalgama nº2",
    "cuba redonda de aco inox de 8cm",
    "cureta alveolar de lucas nº85",
    "cureta gracey 5/6",
    "cureta gracey 7/8",
    "cureta gracey 9/10",
    "cureta gracey 11/12",
    "cureta gracey 13/14",
    "cureta mccall 17/18",
    "cureta mccall 19/20",
    "cureta dentina nº14",
    "cureta dentina nº5",
    "descolador de periosteo tipo molt",
    "esculpidor de hollemback nº3",
    "esculpidor de hollemback nº3s",
    "espatula inox nº7",
    "espatula inox nº10",
    "espatula inox nº24",
    "espatula inox nº31",
    "espatula inox nº36",
    "espatula inox nº70",
    "espatula lecron pequena",
    "espatula para resina titanio nº6",
    "estojo em inox 20x10x05cm estampado e perfurado",
    "foice nº0-00 (foice ponta morse 0-00)",
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
    "grampo para dique de borracha nº210",
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
    "pinca hemostatica mosquito curva 12cm",
    "pinca hemostatica mosquito curva 14cm",
    "pinca hemostatica mosquito reta 12cm",
    "pinca hemostatica mosquito reta 14cm",
    "pinca kelly reta 14cm",
    "pinca para algodao nº17",
    "pinca porta grampo de brewer",
    "porta agulha mayo hegar 14cm",
    "porta agulha mayo hegar 15cm",
    "porta agulha mayo hegar 16cm",
    "porta agulha mayo hegar 18cm",
    "porta algodao com mola",
    "porta amalgama, em plastico autoclavavel",
    "porta detritos odontologico em aco inox",
    "porta matriz tipo tofflemire adulto",
    "porta matriz tipo tofflemire infantil",
    "posicionador radiografico",
    "pote dappen, com tampa autoclavavel, tipo paladon, em vidro",
    "pote dappen de vidro",
    "pote dappen de plástico",
    "refil para tamborel pequeno",
    "regua fina para raio-x",
    "regua milimetradade endodontica metalica",
    "saca-broca universal",
    "seringa carpule dobravel",
    "seringa endodontica de inox",
    "sindesmotomo",
    "sonda exploradora dupla",
    "sonda exploradora modificada dupla",
    "sonda periodontal milimetrada pcp 11.5mm",
    "sonda periodontal milimetrada pcp 12mm",
    "sonda tipo nabers para furca",
    "tesoura castroviejo curva 14cm",
    "tesoura cirurgica reta, medindo 17cm",
    "tesoura de iris reta 11,5cm",
    "tesoura de metzenbaum de 20cm curva",
    "tesoura goldman fox curva",
    "tesoura goldman fox reta",
    "tesoura iris curva 11,5cm",
    "tesoura iris curva de 11cm",
    "tesoura iris reta de 11cm",
    "tesoura joseph reta de 14cm",
    "tesoura metzembaum reta 20cm",
    "tesoura reta grande de 20cm"
];
