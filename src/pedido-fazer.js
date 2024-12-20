const grupos = ['SAÚDE BUCAL', ''];

window.onload = () => {

    document.getElementById("titleCenter").innerHTML = "<b>NOTA DE REQUISIÇÃO E SAÍDA DE MATERIAL</b>";

    localStorage.removeItem("dadosRequerente");

    let itemArray = stringParaArray(itensStringConcatenado);

    itemArray.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        document.getElementById("item-list").appendChild(optionElement);
    });

    nomesUnidades.forEach(u => {
        const optEl = document.createElement("option");
        optEl.value = u.nomeUnidade;
        document.getElementById("u-list").appendChild(optEl);
    });

    grupos.forEach(opt => {
        const optEl = document.createElement("option");
        optEl.value = opt;
        document.getElementById("grupo-list").appendChild(optEl);
    });

    recuperarDadosRequisitanteSessionStorage();

    const itensRecuperados = recuperarDadosItensSessionStorage();
    if(!itensRecuperados.itensDoPedidoExistem) {
        recuperarDadosItensLocalStorage();
        visibilidadeDasLinhas(retornarQuantidadeDeItensLocalStorage());
    } else {
        visibilidadeDasLinhas(itensRecuperados.quantityOfOrderedItems);
    }

    abrirPaginaModoMostrarPedido();
};

document.getElementById('nomeUnidade').addEventListener('change', (e) => {
    const encontrado = nomesUnidades.find( u => u.nomeUnidade == e.target.value);
    document.getElementById('dsSelect').value = encontrado ? encontrado.ds : '-';
    saveInfoRequesterInSessionStorage();
});

function updateTitleWithDate() {
    let dt = document.getElementById('dataPedidoShowPrint').value
    let id_pedido = JSON.parse(sessionStorage.getItem('aberto-nova-aba')) ? `${JSON.parse(sessionStorage.getItem('pedido')).id}-`: "";
    document.getElementById("pageTitle").innerText = id_pedido + "pedido-" + document.getElementById('nomeUnidade').value + "-"+ formatDateString(dt);
};

function cloneDocPrint() {
    const divDocPrintOriginal = document.getElementById("docPrint");
    const divClone = divDocPrintOriginal.cloneNode(true);
    let divDublicada = document.getElementById("docPrintClone");
    divDublicada.innerHTML = '';
    divDublicada.appendChild(divClone);
};

function validateToSend() {
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

document.getElementById("modalConfirmarBtnSim").addEventListener("click", function() {
    sendDataToSpreadSheet();
    loadingInsideBtnSend(true);
    loadingModalShow(true);
})

function loadingInsideBtnSend(b) {
    if (b)
        document.getElementById('btnValidateToSend').innerHTML = `
        <div class='d-flex justify-content-center align-items-center'>
            <div class="spinner-grow spinner-grow-sm" role="status"></div>
            <div>Enviando...</div>
        </div>`;
    else
        document.getElementById('btnValidateToSend').innerHTML = `<i class="bi bi-send"></i><div class="ms-1">Enviar Pedido</div>`;
}

function loadingModalShow(b) {
    const fullcontent = document.querySelector('.full-content');
    if (b) {
        fullcontent.insertAdjacentHTML("afterbegin", `
        <div class="modal" style="background: none !important;" id="loading" data-bs-backdrop="static"
          data-bs-keyboard="false" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered" style="background: none !important;">
            <div class="modal-content" style="background: none !important; border: none;">
              <div class="modal-body" style="text-align: center;">
                <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        `)
        const modalLoading = new bootstrap.Modal(document.getElementById("loading"), {});
        modalLoading.show();
        document.getElementById('btnValidateToSend').disabled = true;
    } else {
        const modalElement = document.getElementById("loading");
        const modalLoading = bootstrap.Modal.getInstance(modalElement);
        modalLoading.hide();
        modalElement.remove();
        document.getElementById('btnValidateToSend').disabled = false;
    }
}

function validarPreenchimentoDeCampos(){
    let messageValidateSending = document.getElementById('messageValidateSending');
    let mensagens = [];
    messageValidateSending.style.cssText = `
        background-color: #f8d7da;
        color: #842029;
        text-align: center
    `;

    let today = new Date().setHours(-3,0,0,0); // seta hr, min, seg, ms. -3 ajustar timeZone para 0.
    let dataInput;
    try {
        dataInput = new Date(document.getElementById('dataPedido').value).toISOString();
    } catch (error) {
        mensagens.push(`O campo <b>Data</b> precisa ser preenchido.</br>`);        
    }
    
    if (dataInput < new Date(today).toISOString())
        mensagens.push(`O campo <b>Data</b> não pode ser uma data passada.</br>`);

    if (dataInput ==="Invalid Date")
        mensagens.push(`O campo <b>Data</b> precisa ser preenchido.</br>`);

    if (document.getElementById('nomeUnidade').value === '')
        mensagens.push(`O campo <b>Unidade Requisitante</b> precisa ser preenchido.</br>`);

    if (document.getElementById('ds').value === '-' || document.getElementById('ds').value === '')
        mensagens.push(`O campo <b>Distrito Sanitário</b> precisa ser preenchido.</br>`);

    if (document.getElementById('grupoMaterial').value === '')
        mensagens.push(`O campo <b>Grupo de Material</b> precisa ser preenchido.</br>`);

    if (sessionStorage.getItem('dadosRequerente') === null)
        mensagens.push(`<b>Erro ao salvar dados da unidade requisitante</b>.</br>`);

    if (!localStorage.getItem('dadosItens'))
        mensagens.push(`Adicione algum item no pedido.</br>`);

    if (sessionStorage.getItem('dadosItens'))
        mensagens.push(`Se o pedido foi carregado por meio do botão <b>"Abrir no formulário"</b> da página <b>"Lista de pedidos"</b>,
        faça uma pequena alteração em algum item ou quantidade deste pedido.</br>`)

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
    if ( recuperarDadosItensSessionStorage().quantityOfOrderedItems === 0 && recuperarDadosItensLocalStorage().quantityOfOrderedItems === 0)
        this.cloneDocPrint();
    this.updateTitleWithDate();
    window.print();
    desabilitarBotaoEnviar(); // desabilita por alguns segundos
    document.getElementById("docPrintClone").innerHTML = "";
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
    document.getElementById('ds').value = document.getElementById("dsSelect").value;
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
        return obj = {itensDoPedidoExistem: true, quantityOfOrderedItems: dadosObj.length};
    } else {
        return obj = {itensDoPedidoExistem: false, quantityOfOrderedItems: 0};
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
        return obj = {itensDoPedidoExistem: false, quantityOfOrderedItems: 0};
    }
};

function formatarDataParaYYYYMMDD(dataAtual) {
    const ano = dataAtual.getFullYear();
    const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
    const dia = dataAtual.getDate().toString().padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    return dataFormatada;
}

function formatDateString(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
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

function sendDataToSpreadSheet() {
    const nomeUnidade = document.getElementById('nomeUnidade').value;
    let instantePedido = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    let nUnid = localStorage.getItem("tipoPedido") === "EXTRA" ? `${nomeUnidade} (EXTRA)` : nomeUnidade;
    let pedidoInfo = {
        requerente: sessionStorage.getItem('dadosRequerente'),
        itens: localStorage.getItem('dadosItens'),
        qtdItens: JSON.parse(localStorage.getItem('dadosItens')).length,
        tipoPedido: localStorage.getItem('tipoPedido'),
        unidade: nUnid.toUpperCase(),
        navegador: "-", // userAgent
        date: instantePedido,
        requisicao: "salvar",
        Date: ''
    };
    submitPostFunctionsNetlify(pedidoInfo);
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
    if (data.success === false || data.numeroPedido === undefined) {
        loadingModalShow(false);
        loadingInsideBtnSend(false);
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
        messageSuccess(data.numeroPedido, data.dataPedido);
        responseModalSuccess(data.numeroPedido, data.dataPedido);
    }
}

function responseModalSuccess(numPedido, dataPedido) {
    document.querySelector('#modalBody').classList.add('message__success-modal');
    abrirModal(`
        <div id="modalEnvioSucesso">
            <div><b>Pedido enviado com sucesso!</b></div>
            <div>Número Pedido: ${numPedido}</div>
            <div class="mb-2">Momento: ${dataPedido}</div>
            <hr>
            <div>
                <a href="pedido-fazer" class="fs-6 text-decoration-none d-flex justify-content-center mb-2 message__success-modal">
                    <div>Fazer um novo pedido</div> <i class="bi bi-cart"></i>
                </a>
            </div>
             <hr>
            <div class="mb-2">
                <a href="${window.location.href}?pedidofeito=${numPedido}" target="_blank" class="fs-6 text-decoration-none d-flex justify-content-center" style="color: #0f5132">
                    <div>Ver o pedido feito</div><i class="bi bi-box-seam ms-1"></i>
                </a>
            </div>
             <hr>
        </div>
    `);
    redirecionarPaginaParaPedidoFeito(numPedido);
    criarLinkWhatsApp(numPedido);
    copiarLinkParaAreaTransferencia(numPedido);
    document.querySelector('#docPrint').classList.add('d-none');
    document.querySelector('#buttons').classList.add('d-none');
}

function redirecionarPaginaParaPedidoFeito(id) {
    const a = document.createElement('a');
    a.href = `${window.location.href}?pedidofeito=${id}`;
    a.target = '_blank'
    a.className = 'fs-6 text-decoration-none d-flex justify-content-center';
    a.style.cssText = 'color: #0f5132';
    a.innerHTML = `<div>Ver o pedido feito</div> <i class="bi bi-box-seam ms-1"></i>`;
    document.querySelector('#messageSuccess').appendChild(a);
    document.querySelector('#messageSuccess').appendChild(document.createElement('hr'));
}

function messageSuccess(nPedido, datePedido) {
    loadingModalShow(false);
    loadingInsideBtnSend(false);
    let messageSuccess = document.getElementById('messageSuccess');
    messageSuccess.innerHTML =
    `<div class="fs-6">
        <h4><b>Pedido enviado com sucesso!</b></h4>
        <div>
            <span>Número Pedido: </span> <b>${nPedido}</b>
        </div>
        <div class="mb-2">
            <span>Momento: </span> <b>${datePedido}</b>
        </div>
        <hr>
        <div>
            <a href="pedido-fazer" class="text-decoration-none d-flex justify-content-center mb-2 message__success">
                <div>Fazer um novo pedido</div> <i class="bi bi-cart"></i>
            </a>
        </div>
        <hr>
    </div>
    `;
}

function catchError(error) {
    abrirModal(`
        <div class="flex-row">
            <div>Aconteceu um erro!</div>
            <div>Pode ser que sua solicitação não tenha sido enviada.</div>
            <div>Mensagem de Erro:</div>
            <div>${error}</div>
        </div>
    `);
    loadingModalShow(false);
    loadingInsideBtnSend(false);
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
        document.getElementById('btnValidateToSend').disabled = true;
        setTimeout(function () {
            botaoHabilitado = true;
            document.getElementById('btnValidateToSend').disabled = false;
        }, 3000);
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

function criarLinkWhatsApp(id) {
    document.querySelector('#modalEnvioSucesso').appendChild(criarElementoWs(id));
    document.querySelector('#messageSuccess').appendChild(criarElementoWs(id));
}

function criarElementoWs(id) {
    const elDivWs = document.createElement('div');
    const linkWhatsApp = `https://wa.me/?text=${window.location.href}?pedidofeito=${id}`;
    const eleI = document.createElement('i');
    eleI.className = 'bi bi-whatsapp ms-1';
    const eleA = document.createElement('a');
    eleA.href = linkWhatsApp;
    eleA.textContent = 'Compartilhar pedido no WhatsApp';
    eleA.target = '_blank';
    eleA.className = 'mt-2 fs-6';
    eleA.style.cssText = "text-decoration: none; color: #0f5132";
    eleA.appendChild(eleI);
    elDivWs.appendChild(eleA);
    elDivWs.appendChild(document.createElement('hr'));
    return elDivWs;
}

function copiarLinkParaAreaTransferencia(id) {
    const link = `${window.location.href}?pedidofeito=${id}`;
    linkCopiarNoModal(link);
    linkCopiar(link);
}

function linkCopiarNoModal(link) {
    const linkCopyModal = criarElementoTag('linkParaCopiarModal', 'divCopyModal');
    document.querySelector('#modalEnvioSucesso').appendChild(linkCopyModal);
    document.getElementById('linkParaCopiarModal').addEventListener('click', function(event) {
        event.preventDefault();
        copiarTextoParaAreaTransferencia(link, linkCopyModal.querySelector('span').id, 'divCopyModal');
    });
}

function linkCopiar(link) {
    const linkCopy = criarElementoTag('linkParaCopiar', 'divCopy');
    document.querySelector('#messageSuccess').appendChild(linkCopy);
    document.getElementById('linkParaCopiar').addEventListener('click', function(event) {
        event.preventDefault();
        copiarTextoParaAreaTransferencia(link, linkCopy.querySelector('span').id, 'divCopy');
    });
}

function criarElementoTag(idEl, idDev) {
    const elDiv = document.createElement('div');
    elDiv.id = idDev;
    elDiv.className = "mb-4";
    const el = document.createElement('span');
    el.innerHTML = '<div>Copiar o link do pedido';
    el.id = idEl;
    el.style.cssText = "text-decoration: none;";
    el.className = "fs-6 d-flex justify-content-center";
    elDiv.appendChild(el);
    el.addEventListener('mouseover', () => {
        el.style.cursor = 'pointer';
    });
    el.addEventListener('mouseout', () => {
        el.style.cursor = 'default';
    });
    const iEl = document.createElement('i');
    iEl.className = 'bi bi-copy ms-1';
    el.appendChild(iEl);
    return elDiv;
}

function copiarTextoParaAreaTransferencia(link, id, iDdiv){
    let r = document.createRange();
    document.getElementById(id).innerText = link;
    r.selectNode(document.getElementById(id));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    try {
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        document.getElementById(id).innerText = "Link copiado";
        setTimeout(() => {
            document.getElementById(iDdiv).remove();
            if (iDdiv == 'divCopyModal')
                linkCopiarNoModal(link);
            if (iDdiv == 'divCopy')
                linkCopiar(link);
        }, 4000);
    } catch (e) {
        console.log('Não foi possível copiar!');
        alert(`'Não foi possível copiar! ${e}`)
    }
}

let bNovaAba = JSON.parse(sessionStorage.getItem("aberto-nova-aba"));
let idPedidoGlobal = "";

function abrirPaginaModoMostrarPedido(){
    const params = new URLSearchParams(window.location.search);
    let id = params.get('pedidofeito');
    id && getPedido(id) || bNovaAba && AplicarEstiloVisualizarPedido();
};

async function getPedido(id) {
    limparCamposItens();
    sessionStorage.removeItem("dadosRequerente");
    sessionStorage.removeItem('dadosItens');
    disableInputs();
    hideButtons();
    spinnerLoading();
    document.querySelector('#docPrint').style.display = 'none';
    sessionStorage.removeItem("pedido");
    try {
        let pedido = await fetch(`/.netlify/functions/api-spreadsheet?id=${id}`)
        .then( data => {
            return data.json();
        })
        showButtonPrintAndClose();
        document.querySelector('#docPrint').style.display = 'block';
        pedido.responseDataPedidos.result || abrirPedidoModoVisualizar(pedido);
        !pedido.responseDataPedidos.result || redirectPage(); //Quando não existe pedido
    } catch (error) {
        redirectPage();
    }
}

function abrirPedidoModoVisualizar(pedido) {
    localStorage.setItem('dadosItens', JSON.stringify(pedido.responseDataPedidos.itens));
    recuperarDadosItensLocalStorage();
    sessionStorage.setItem('dadosRequerente', JSON.stringify(pedido.responseDataPedidos.requisitante));
    recuperarDadosRequisitanteSessionStorage();
    visibilidadeDasLinhas(pedido.responseDataPedidos.qtdItens);
    changePageTitleAndTitleCenter(pedido.responseDataPedidos.id);
    removeSpinnerLoading();
}

function redirectPage() {
    window.location.href = window.location.origin;
}

function spinnerLoading() {
    const centerContent = document.querySelector(".center-content");
    centerContent.insertAdjacentHTML("afterbegin", `
        <div id="spinnerGrow" class="spinner-grow" style="top:50%; left:50%; position:absolute"></div>`);
}

function removeSpinnerLoading() {
    const centerContent = document.querySelector(".center-content");
    const spinner = centerContent.querySelector("#spinnerGrow");
    spinner && spinner.remove();
}

function AplicarEstiloVisualizarPedido() {
    disableInputs();
    hideButtons();
    let pedido = JSON.parse(sessionStorage.getItem('pedido'));
    changePageTitleAndTitleCenter(pedido.id);
    idPedidoGlobal = pedido.id;
    showButtonPrintAndClose();
}

function changePageTitleAndTitleCenter(id) {
    document.querySelector('#pageTitle').innerHTML = `${id}`;
    document.getElementById("titleCenter").innerHTML = `PEDIDO ${id} - <b>NOTA DE REQUISIÇÃO E SAÍDA DE MATERIAL</b>`;
}

function showButtonPrintAndClose() {
    document.querySelector('#btnPrint').style.display = 'block';

    let centerContent = document.querySelector("#btnConfig");
    centerContent.insertAdjacentHTML("beforeend", `<div class="mt-2 text-secondary" id="linkPedido"></div>`);
    centerContent.insertAdjacentHTML("beforeend", `<button id="btnCopyLink" class="btn mt-2 btn__config" onclick="copyText('linkPedido')">Copiar link</button>`);
    centerContent.insertAdjacentHTML("beforeend", `<button class="btn btn-outline-success my-2 btn__config" onclick="abrirWhatsApp()">Compartilhar no Whatsapp</button>`);
    if (window.opener)
        centerContent.insertAdjacentHTML("beforeend", `<button class="btn btn-secondary my-4 btn__config" onclick="fecharAba()">Fechar</button>`);
    else
        centerContent.insertAdjacentHTML("beforeend", `<a class="btn btn-link my-4" href="${window.location.origin}">Página Principal</a>`);
}

function hideButtons() {
    document.querySelector('#btnValidateToSend').classList.add('d-none');
    document.querySelector('.tipo__pedido').style.display = 'none';
    document.querySelector('#btnPrint').style.display = 'none';
    document.querySelector('#toggleButton').style.display = 'none';
    document.querySelector('#cleanHeader').style.display = 'none';
    document.querySelector('#cleanItens').style.display = 'none';
    document.querySelector('header-component').style.display = 'none';
}

function disableInputs() {
    const inputs = document.querySelectorAll('input');
    let i = 0;
    let b = true;
    inputs.forEach((input, index) => {
        input.setAttribute('disabled', true);
        input.style.cssText = 'background-color:transparent; color: black';

        if(input.id === ''){
            if (b){
                i = i+1;
                input.style.cssText = 'background-color: #f7f7f7; color: black'
            }else{
                i = i+1;
                input.style.cssText = 'background-color:transparent; color: black'
            }
            if(i>=2){
                i = 0;
                if(b)
                    b = false
                else
                    b = true;
            }
        }
    });

    document.querySelectorAll('select').forEach(select => {
        select.setAttribute('disabled', true)
        select.style.cssText = 'background-color:transparent; color: black';
    });
    document.querySelectorAll('.btn__quant').forEach( btnQuant => {
        btnQuant.style.cssText = 'display: none';
    })
}

function abrirWhatsApp() {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('pedidofeito');
    link = id ? `https://wa.me/?text=${window.location.href}` : `https://wa.me/?text=${window.location.href}?pedidofeito=${idPedidoGlobal}`;
    window.open(link, '_blank');
}

function fecharAba(){
    sessionStorage.setItem('aberto-nova-aba', false);
    window.close();
}

document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function() {
        if (document.querySelector('#linkPedido')) {
          const linkPedido = document.querySelector('#linkPedido');
          linkPedido.innerText = retornarLink();
          linkPedido.style.cssText = 'place-self: center';
          observer.disconnect();
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
});

function copyText(id){
    let r = document.createRange();
    document.getElementById(id).innerText = retornarLink();
    r.selectNode(document.getElementById(id));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    try {
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        let btnCopyLink = document.getElementById('btnCopyLink');
        btnCopyLink.innerText = "Link copiado";
        btnCopyLink.style.cssText = "background-color:white; color:#495057"
        setTimeout(() => {
            btnCopyLink.innerText = "Copiar link";
            btnCopyLink.style.cssText = "background-color:transparent; color:#212529"
        }, 3000);
    } catch (e) {
        console.log('Não foi possível copiar!');
        alert(`'Não foi possível copiar! ${e}`)
    }
}

function retornarLink() {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('pedidofeito');
    return link = id ? `${window.location.href}` : `${window.location.href}?pedidofeito=${idPedidoGlobal}`;
}