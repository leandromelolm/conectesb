const datalist = document.getElementById("item-list");
const undlist = document.getElementById("u-list");
const grupoList = document.getElementById("grupo-list");
let nomeUnidade = document.getElementById("nomeUnidade");

const grupos = ['SAÚDE BUCAL', ''];

let requerenteForm;
let itensForm;
let scriptUrl;
let appEnv;

window.onload = () => {

    document.getElementById("titleCenter").innerHTML = "<b>NOTA DE REQUISIÇÃO E SAÍDA DE MATERIAL</b>";

    localStorage.removeItem("dadosRequerente");

    let itemArray = stringParaArray(itensStringConcatenado);

    itemArray.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        datalist.appendChild(optionElement);
    });

    nomesUnidades.forEach(opt => {
        const optEl = document.createElement("option");
        optEl.value = opt;
        undlist.appendChild(optEl);
    });

    grupos.forEach(opt => {
        const optEl = document.createElement("option");
        optEl.value = opt;
        grupoList.appendChild(optEl);
    });

    recuperarDadosRequisitanteSessionStorage();

    const itensRecuperados = recuperarDadosItensSessionStorage();
    if(!itensRecuperados.itensDoPedidoExistem) {
        recuperarDadosItensLocalStorage();
        visibilidadeDasLinhas(retornarQuantidadeDeItensLocalStorage());
    } else {
        visibilidadeDasLinhas(itensRecuperados.quantityOfOrderedItems);
    }

};

function updateTitleWithDate() {
    document.getElementById("pageTitle")
        .innerText = "sb-material-" + nomeUnidade.value + "-"
        + new Date().toISOString(('pt-BR', { timezone: 'UTC' })).substring(0, 10);
};

function cloneDocPrint() {
    const divDocPrintOriginal = document.getElementById("docPrint");
    const divClone = divDocPrintOriginal.cloneNode(true);
    let divDublicada = document.getElementById("docPrintClone");
    divDublicada.innerHTML = '';
    divDublicada.appendChild(divClone);
};

function sendToSpreadsheet() {
    document.querySelector('#messageSuccess').innerHTML = '';
    document.querySelector('#messageError').innerHTML = '';

    const messageValidateSending = validarPreenchimentoDeCampos();
    if (messageValidateSending.innerHTML.trim() !== '') {
        return;
    }

    document.querySelector('#messageValidateSending').innerHTML = "";    
    messageValidateSending.style.backgroundColor = 'transparent';
    messageValidateSending.style.height = '1px';    
    modalConfirmarEnvio();  
}

function modalConfirmarEnvio() {
    let myModal = new bootstrap.Modal(document.getElementById('modal-confirmar-envio'));
    myModal.toggle();
}

function abrirModal(str) {
    let myModal = new bootstrap.Modal(document.getElementById('modal-resposta-envio'));
    myModal.toggle();
    document.querySelector("#modalBody").innerHTML = str;
}

document.getElementById("btn-sim").addEventListener("click", function() {
    fetchPostSaveSheetGoogle();
    document.getElementById('btnSendSpreadsheet').disabled = true;
})

function validarPreenchimentoDeCampos(){
    let messageValidateSending = document.getElementById('messageValidateSending');
    let mensagens = [];
    messageValidateSending.style.cssText = `
        background-color: #f8d7da;
        color: #842029; 
        text-align: center        
    `;

    let dataInput = new Date(document.getElementById('dataPedido').value);
    dataInput.setTime(dataInput.getTime() + dataInput.getTimezoneOffset() * 60 * 1000);

    if (dataInput.toLocaleDateString() < new Date().toLocaleDateString())
        mensagens.push(`O campo <b>Data</b> não pode ser uma data passada.</br>`);

    if (dataInput.toLocaleDateString() ==="Invalid Date")
        mensagens.push(`O campo <b>Data</b> precisa ser preenchido.</br>`);
    
    if (document.getElementById('nomeUnidade').value === '')      
        mensagens.push(`O campo <b>Unidade Requisitante</b> precisa ser preenchido.</br>`);    
    
    if (document.getElementById('ds').value === '-' || document.getElementById('ds').value === '')
        mensagens.push(`O campo <b>Distrito Sanitário</b> precisa ser preenchido.</br>`);     
    
    if (document.getElementById('grupoMaterial').value === '')
        mensagens.push(`O campo <b>Grupo de Material</b> precisa ser preenchido.</br>`);
    
    if (sessionStorage.getItem('dadosRequerente') === null)
        mensagens.push(`<b>Erro ao salvar dados da unidade requisitante</b> tente outro navegador se o erro persistir.</br>`); 

    messageValidateSending.innerHTML = mensagens.join("");
    return messageValidateSending;
}

function printPage() {
    if (document.getElementById('dataPedido').value) {
        date = new Date(document.getElementById('dataPedido').value);
        document.getElementById('dataPedidoShowPrint').value = date.toLocaleDateString('pt-Br', { timeZone: 'UTC' });
    } else {
        document.getElementById('dataPedidoShowPrint').value = "          /          /      "
    }
    this.cloneDocPrint();
    this.updateTitleWithDate();
    window.print();
    desabilitarBotaoEnviar(); // desabilita por alguns segundos
};

function toggleRowVisibility() {
    const rows = document.querySelectorAll('.tr_hidden');
    const toggleButton = document.getElementById('toggleButton');
    rows.forEach(row => {
        if (row.style.display === 'table-row') {
            row.style.display = 'none'; // Esconder a linha
            toggleButton.innerHTML = '<img src="assets/plus-lg.svg" alt=""> Mostrar Mais Linhas';
            document.querySelector('.div__margin-top_print_firefox').classList.add('d-none');
            document.querySelector('.img-right').style.cssText = `margin-top: 0px;`
        } else {
            row.style.display = 'table-row'; // Mostrar a linha
            toggleButton.innerHTML = '<img src="assets/minus.svg" alt=""> Mostrar Menos Linhas';
            document.querySelector('.div__margin-top_print_firefox').classList.remove('d-none');
            document.querySelector('.img-right').style.cssText = `margin-top: 10px;`
        }
    });
};

function visibilidadeDasLinhas(quantidadeItens) {
    const rows = document.querySelectorAll('.tr_hidden');
    const toggleButton = document.getElementById('toggleButton');
    if (quantidadeItens > 10) {
        rows.forEach(row => {
            row.style.display = 'table-row'; // EXIBIR
        });
        toggleButton.innerHTML = '<img src="assets/minus.svg" alt=""> Mostrar Menos Linhas';
    }
    if (quantidadeItens <= 10) {
        rows.forEach(row => {
            row.style.display = 'none'; // ESCONDER
        });
        toggleButton.innerHTML = '<img src="assets/plus-lg.svg" alt=""> Mostrar Mais Linhas';
    }
}


function saveInfoRequesterInSessionStorage() {
    document.getElementById('ds').value = document.getElementById("dsSelect").value;;    
    document.getElementById('equipe').value =  document.getElementById('equipeSelect').value;
    let dadosRequerente = {
        nomeUnidade: document.getElementById('nomeUnidade').value,
        equipe: document.getElementById('equipe').value,
        ds: document.getElementById('ds').value,
        dataPedido: document.getElementById('dataPedido').value,
        grupoMaterial: document.getElementById('grupoMaterial').value,
        nomeResponsavel: document.getElementById('nomeResponsavel').value
    }
    sessionStorage.setItem("dadosRequerente", JSON.stringify(dadosRequerente));
};

function saveDataItensLocalStorage() {
    let dados = [];
    // Iterar por todas as linhas de input
    let linhas = document.querySelectorAll('#tableItens tbody tr');
    limparValoresDaColunaItem();
    const cells = document.querySelectorAll(".item");

    linhas.forEach(function (linha, index) {
        let inputEspecificacao = linha.querySelector('.td__especificacao input');
        let inputQuantidade = linha.querySelector('.td__quant_pedida input');
        let produto = inputEspecificacao.value.trim();
        if (produto !== '') {
            let item = {
                especificacao: produto,
                quantidade: inputQuantidade.value
            };
            dados.push(item);
            const celulaItem = cells[index + 1];
            celulaItem.textContent = index + 1;
             
        }
    });
    visibilidadeDasLinhas(dados.length);
    localStorage.setItem('dadosItens', JSON.stringify(dados));
    sessionStorage.removeItem('dadosItens');
};

// Adiciona um evento 'input' para salvar os dados no Local Storage automaticamente
let inputs = document.querySelectorAll('#tableItens tbody tr .td__especificacao input, #tableItens tbody tr .td__quant_pedida input');
inputs.forEach(function (input) {
    input.addEventListener('input', saveDataItensLocalStorage);
});

function recuperarDadosRequisitanteSessionStorage() {
    let requerenteJson = sessionStorage.getItem("dadosRequerente");    
    if (requerenteJson) {
        let requerente = JSON.parse(requerenteJson)
        document.getElementById('nomeUnidade').value = requerente.nomeUnidade;
        document.getElementById('ds').value = requerente.ds || "5";
        document.getElementById('dsSelect').value = requerente.ds || "5";
        document.getElementById('equipe').value = requerente.equipe || "-";
        document.getElementById('equipeSelect').value = requerente.equipe || "-";
        document.getElementById('grupoMaterial').value = requerente.grupoMaterial;
        document.getElementById('nomeResponsavel').value = requerente.nomeResponsavel;
        document.getElementById('dataPedido').value = 
            requerente.dataPedido ? requerente.dataPedido : formatarDataParaYYYYMMDD(new Date());
    } else {
        document.getElementById('dataPedido').value = formatarDataParaYYYYMMDD(new Date());
        document.getElementById('grupoMaterial').value = '';
        document.getElementById('ds').value = '';
    }
};

function recuperarDadosItensLocalStorage() {
    let dadosJSON = localStorage.getItem('dadosItens');    
    if (dadosJSON) {
        let dadosObj = JSON.parse(dadosJSON);

        // Iterar pelos dados e preencher os inputs correspondentes
        let linhas = document.querySelectorAll('#tableItens tbody tr');
        linhas.forEach(function (linha, index) {
            let inputEspecificacao = linha.querySelector('.td__especificacao input');
            let inputQuantidade = linha.querySelector('.td__quant_pedida input');
            const cells = document.querySelectorAll(".item");
            if (index < dadosObj.length) {
                const celulaItem = cells[index + 1];
                celulaItem.textContent = index + 1;
                if (inputEspecificacao) {
                    inputEspecificacao.value = dadosObj[index].especificacao;
                }
                if (inputQuantidade) {
                    inputQuantidade.value = dadosObj[index].quantidade;
                }
            }
        });
    }
};

function retornarQuantidadeDeItensLocalStorage() {
    let dadosJSON = localStorage.getItem('dadosItens');
    if (dadosJSON) {
        let dadosObj = JSON.parse(dadosJSON);
        return dadosObj.length;
    } else {
        return 0;
    }
}

function recuperarDadosItensSessionStorage() {
    let dadosJSON = sessionStorage.getItem('dadosItens');
    let obj = {};
    if (dadosJSON) {
        let dadosObj = JSON.parse(dadosJSON);

        // Iterar pelos dados e preencher os inputs correspondentes
        let linhas = document.querySelectorAll('#tableItens tbody tr');
        linhas.forEach(function (linha, index) {
            let inputEspecificacao = linha.querySelector('.td__especificacao input');
            let inputQuantidade = linha.querySelector('.td__quant_pedida input');
            const cells = document.querySelectorAll(".item");
            if (index < dadosObj.length) {
                const celulaItem = cells[index + 1];
                celulaItem.textContent = index + 1;
                if (inputEspecificacao) {
                    inputEspecificacao.value = dadosObj[index].especificacao;
                }
                if (inputQuantidade) {
                    inputQuantidade.value = dadosObj[index].quantidade;
                }
            }
        });
        return obj = {itensDoPedidoExistem: true, quantityOfOrderedItems: dadosObj.length};
    } else {
        return obj = {itensDoPedidoExistem: false};
    }
};

function formatarDataParaYYYYMMDD(dataAtual) {
    const ano = dataAtual.getFullYear();
    const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
    const dia = dataAtual.getDate().toString().padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    return dataFormatada;
}

function inputsRequestorClean() {
    let ok = confirm(`Tem certeza de que deseja limpar os dados preenchidos no formulário?
Essa ação apagará os campos: 
UNIDADE REQUISITANTE,
EQUIPE,
DISTRITO, 
GRUPO DE MATERIAL 
E FUNCIONÁRIO RESPONSÁVEL
`);
    if (ok) {
        limparCamposInfoUnidade();
    }
};

function limparCamposInfoUnidade() {
    document.getElementById('nomeUnidade').value = '';
    document.getElementById('equipe').value = '-';
    document.getElementById('equipeSelect').value = "-";
    document.getElementById('ds').value = '';
    document.getElementById('dsSelect').value = '-';
    document.getElementById('dataPedido').value = '';
    document.getElementById('grupoMaterial').value = '';
    document.getElementById('nomeResponsavel').value = '';
    localStorage.removeItem('dadosRequerente');
    sessionStorage.removeItem('dadosRequerente');
}

function inputsItensClean() {
    let ok = confirm(`Tem certeza de que deseja limpar os ITENS PEDIDOS?
Essa ação apagará os campos da coluna: 
ESPECIFICAÇÕES E QUANTIDADE PEDIDA 
`);
    if (ok) {
        limparCamposItens();
    }
};

function limparCamposItens() {
    let inputs = document.querySelectorAll('#tableItens tbody tr .td__especificacao input, #tableItens tbody tr .td__quant_pedida input');
    inputs.forEach(function (input) {
        input.value = '';
    });
    localStorage.removeItem('dadosItens');
    sessionStorage.removeItem('dadosItens');
    limparValoresDaColunaItem();
}

function limparTudo() {
    limparCamposInfoUnidade();
    limparCamposItens();
}

function limparValoresDaColunaItem() {
    const cells = document.querySelectorAll(".item");
    let i = 0;
    cells.forEach((celula) => {
        i = i + 1
        if (i > 1) {
            // i = 1 é a célula cabeçalho (th) da coluna item
            celula.textContent = "";
        }
    });
}

function stringParaArray(string) {
    const linhas = string.trim().split('\n');
    return linhas;
};

function fetchPostSaveSheetGoogle() {
    const nomeUnidade = document.getElementById('nomeUnidade').value;
    let instantePedido = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    let nUnid = localStorage.getItem("tipoPedido") === "EXTRA" ? `${nomeUnidade} (EXTRA)` : nomeUnidade;
    let pedidoInfo = {
        requerente: sessionStorage.getItem('dadosRequerente'),
        itens: localStorage.getItem('dadosItens'),
        tipoPedido: localStorage.getItem('tipoPedido'),
        unidade: nUnid.toUpperCase(),
        navegador: "-", // userAgent
        date: instantePedido,
        requisicao: "salvar",
        Date: ''
    };
    // let params = new URLSearchParams(pedidoInfo);
    // let sheetId = "";
    // params.append("sheetId", sheetId);    
    // let sheetName = appEnv === "dev" ? "Sheet1-test" : "Sheet1";
    // params.append("sheetName", sheetName);
    submitPostFunctionsNetlify(pedidoInfo);
    document.getElementById('divLoadingById').classList.remove('d-none'); 
};

function submitPostFunctionsNetlify(pedidoInfo) {
    fetch('/.netlify/functions/api-spreadsheet', {
        method: 'POST',
        body: JSON.stringify(pedidoInfo)
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log(data);
        responseFetch(data);  
    }).catch(function(error) {
        catchError(error);
    });
}

function responseFetch(data) {
    document.getElementById('btnSendSpreadsheet').disabled = false;
    if (data.success === false || data.numeroPedido === undefined) {
        document.getElementById('divLoadingById').classList.add('d-none');
        let messageError = document.getElementById('messageError');        
        messageError.innerHTML =`
            <h4>
                <b>Erro no envio!</b>
            </h4>
            <div>
                <span>Verifique a conexão com a internet e tente novamente, se o erro repetir contate o administrador.</span>
                <!-- Messagem do erro: <b>${data.error}</b> -->
            </div>
        `;
        return abrirModal("Pedido não enviado! Erro no envio.");

    } else {
        limparTudo();
        document.getElementById('divLoadingById').classList.add('d-none');
        let messageSuccess = document.getElementById('messageSuccess');
        messageSuccess.innerHTML =
        `<h4>
            <b>Pedido enviado com sucesso!</b>
        </h4>
        <div>
            <span>Número Pedido: </span> <b>${data.numeroPedido}</b>
        </div>
        <div>
            <span>Momento: </span> <b>${data.dataPedido}</b>
        </div>         
        `;
        abrirModal(`
            <div class="flex-row">
                <div>Pedido enviado com sucesso!</div>
                <div>Número Pedido: ${data.numeroPedido}</div>
                <div>Momento: ${data.dataPedido}</div>
            </div>            
        `);
    }
}

function catchError(error) {
    document.getElementById('btnSendSpreadsheet').disabled = false; // habilitar botão enviar

    abrirModal(`
        <div class="flex-row">
            <div>Aconteceu um erro!</div>
            <div>Pode ser que sua solicitação não tenha sido enviada.</div>
            <div>Mensagem de Erro:</div>
            <div>${error}</div>
        </div>            
    `);
    
    document.getElementById('divLoadingById').classList.add('d-none');
    let messageValidateSending = document.getElementById('messageValidateSending');
    messageValidateSending.style.cssText = `
        background-color: #f8d7da;
        color: #842029;
        height: auto;
        text-align: center;
        display: grid;
        border-radius: 5px;
    `;

    document.querySelector('#messageValidateSending').innerHTML = `
        <h4><b>Erro no envio!</b></h4>
        <div>Tente novamente!</div>
        <div>Se o erro persistir, verifique a conexão com a internet ou tente novamente mais tarde.</div>
        <div>Caso ainda continue a messagem de erro, contate o administrador e informe a menssagem de erro.</div>
        <div>Messagem do erro: <b>${error}</b></div>
    `;
}

let botaoHabilitado = true;
function desabilitarBotaoEnviar() {
    if (botaoHabilitado) {
        botaoHabilitado = false;
        document.getElementById('btnSendSpreadsheet').disabled = true;
        setTimeout(function () {
            botaoHabilitado = true;
            document.getElementById('btnSendSpreadsheet').disabled = false;
        }, 6000);
    }
}

$('input[type="checkbox"]').on('change', function (e) {
    const mensalCheckbox = document.getElementById("mensal");
    const extraCheckbox = document.getElementById("extra");
    if (e.target.name === 'mensal') {
        extraCheckbox.checked = false;
        localStorage.setItem("tipoPedido", e.target.name.toUpperCase());
    }
    if (e.target.name === 'extra') {
        mensalCheckbox.checked = false;
        localStorage.setItem("tipoPedido", e.target.name.toUpperCase());
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const mensalCheckbox = document.getElementById("mensal");
    const extraCheckbox = document.getElementById("extra");
    const tipoPedido = localStorage.getItem("tipoPedido");

    if (tipoPedido === "MENSAL") {
        mensalCheckbox.checked = true;
        extraCheckbox.checked = false;
    } else if (tipoPedido === "EXTRA") {
        extraCheckbox.checked = true;
        mensalCheckbox.checked = false;
    }
});

function fetchPostTest(params){
    fetch(scriptUrl, {
        method: "POST",
        body: params
    }).then(function (response) {
        return response.text();
    }).then(function (text) {
        responseFetch(text, instantePedido);
    }).catch(function (error) {
        alert(error);
        console.log(error)
    });
}


const userAgent = navigator.userAgent;
// Verificar o navegador usado para testar em caso de erro
if (userAgent.includes("Chrome")) {
    document.querySelector(".browser__style").setAttribute("data-navegador", "chrome");
} else if (userAgent.includes("Firefox")) {
    document.querySelector(".browser__style").setAttribute("data-navegador", "firefox");
} else if (userAgent.includes("Edge")) {
    document.querySelector(".browser__style").setAttribute("data-navegador", "edge");
} else if (userAgent.includes("Safari")) {
    document.querySelector(".browser__style").setAttribute("data-navegador", "safari");
} else {
    document.querySelector(".browser__style").setAttribute("data-navegador", "desconhecido");
}


$(document).ready(function () {
    $('.div__quant_pedida').on('click', '.subtrairBtn', function () {
        let inputQuantidade = $(this).siblings('.input__quantidade');        
        subtrair(inputQuantidade);
    });

    $('.div__quant_pedida').on('click', '.somarBtn', function () {
        let inputQuantidade = $(this).siblings('.input__quantidade');
        somar(inputQuantidade);
    });
});
  
function somar(inputQuantidade) {
    let resultado = parseInt(inputQuantidade.val()) || 0;
    resultado++;
    inputQuantidade.val(resultado);
    saveDataItensLocalStorage();
}

function subtrair(inputQuantidade) {
    let resultado = parseInt(inputQuantidade.val()) || 0;
    resultado = (resultado > 1) ? resultado - 1 : null;
    inputQuantidade.val(resultado);
    saveDataItensLocalStorage();
}