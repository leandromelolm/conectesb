document.getElementById("titleCenter").innerHTML = "<b>NOTA DE REQUISIÇÃO E SAÍDA DE MATERIAL</b>";

const datalist = document.getElementById("item-list");
const undlist = document.getElementById("u-list")
let nomeUnidade = document.getElementById("nomeUnidade");

let requerenteForm;
let itensForm;
// appscript v10 - OBS. v16 fecth blocked - CORS policy: No 'Access-Control-Allow-Origin' 
let scriptUrl = 'https://script.google.com/macros/s/AKfycbw1sMXgBUIV7ViGvizX35k2GvlD1MMG4Mv8n7W0A-PE9mXo7C4qqkbBg9_WzKY5Eaf-Tg/exec';

window.onload = () => {

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

    recuperarDadosRequisitanteLocalStorage();
    recuperarDadosItensLocalStorage();
    visibilidadeDasLinhas();
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

function sendToSpreadsheet(){
    if (document.getElementById('nomeUnidade').value === '') {
        let msgEnvioPedido = document.getElementById('msgEnvioPedido');
        msgEnvioPedido.style.backgroundColor = '#FF6347';
        msgEnvioPedido.style.color = 'white'
        msgEnvioPedido.style.height =  '35px';
        msgEnvioPedido.style.textAlign = 'center';

        return  document.querySelector(
            '#msgEnvioPedido').innerHTML =
            `Preencha o campo <b>Unidade Requisitante</b> para poder enviar o pedido.`;
    }
    const dataAtual = new Date();
    const umDiaEmMilissegundos = 86400000;
    const dataAnterior = new Date(dataAtual.getTime() - umDiaEmMilissegundos);
    const dataFornecida = new Date(document.getElementById('dataPedido').value);    
    if (dataFornecida < dataAnterior) {
        msgEnvioPedido.style.backgroundColor = '#FF6347';
        msgEnvioPedido.style.color = 'white'
        msgEnvioPedido.style.height =  '35px';
        msgEnvioPedido.style.textAlign = 'center';
        return  document.querySelector(
            '#msgEnvioPedido').innerHTML =
            `Não é possível enviar pedido. A data não pode ser uma data passada.
            Verifique o campo <b>Data</b> no formulário.`;
    }else{}
    document.querySelector('#msgEnvioPedido').innerHTML ="";
    msgEnvioPedido.style.backgroundColor = 'white';   
    msgEnvioPedido.style.height =  '1px';
    let ok = confirm(`Clique em OK para confirmar o envio?`);
    if (ok) {
        saveSheetGoogle();
        desabilitarBotaoEnviar();
        // printPage();
    }
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
    rows.forEach(row => {
        if (row.style.display === 'table-row') {
            row.style.display = 'none'; // Esconder a linha
        } else {
            row.style.display = 'table-row'; // Mostrar a linha
        }
    });
    const button = document.getElementById('toggleButton');
    if (button.value === 'Mostrar Mais Linhas') {
        button.value = 'Mostrar Menos Linhas';
    } else {
        button.value = 'Mostrar Mais Linhas';
    }    
};

function visibilidadeDasLinhas(){
    let dadosJSON = localStorage.getItem('dadosItens');
    const rows = document.querySelectorAll('.tr_hidden');
    const button = document.getElementById('toggleButton');
    if (dadosJSON) {
        let dadosObj = JSON.parse(dadosJSON);        
        if (dadosObj.length > 10) {
            rows.forEach(row => {
                row.style.display = 'table-row'; // EXIBIR
            });
            button.value = 'Mostrar Menos Linhas';
        }
        if (dadosObj.length <= 10) {
            rows.forEach(row => {
                row.style.display = 'none'; // ESCONDER
            });
            button.value = 'Mostrar Menos Linhas';
        }
    }
}

function saveRequesterLocaStorage() {
    let dadosRequerente = {
        nomeUnidade: document.getElementById('nomeUnidade').value,
        ds: document.getElementById('ds').value,
        dataPedido: document.getElementById('dataPedido').value,
        grupoMaterial: document.getElementById('grupoMaterial').value,
        nomeResponsavel: document.getElementById('nomeResponsavel').value
    }
    localStorage.setItem("dadosRequerente", JSON.stringify(dadosRequerente));
};

function saveDataItensLocalStorage() {
    let dados = [];
    // Iterar por todas as linhas de input
    let linhas = document.querySelectorAll('#tableItens tbody tr');
    linhas.forEach(function (linha, index) {
        let inputEspecificacao = linha.querySelector('.td__especificacao input');
        let inputQuantidade = linha.querySelector('.td__quant_pedida input');
        let produto = inputEspecificacao.value.trim();
        if (produto !== ''){
            let item = {
                especificacao: produto,
                quantidade: inputQuantidade.value
            };
            dados.push(item);
            console.log(dados.length);
            visibilidadeDasLinhas();
        }
    });
    localStorage.setItem('dadosItens', JSON.stringify(dados));
};

// Adiciona um evento 'input' para salvar os dados no Local Storage automaticamente
let inputs = document.querySelectorAll('#tableItens tbody tr .td__especificacao input, #tableItens tbody tr .td__quant_pedida input');
inputs.forEach(function (input) {
    input.addEventListener('input', saveDataItensLocalStorage);
});

function recuperarDadosRequisitanteLocalStorage() {
    let requerenteJson = localStorage.getItem("dadosRequerente");
    if (requerenteJson) {
        let requerente = JSON.parse(requerenteJson)
        document.getElementById('nomeUnidade').value = requerente.nomeUnidade;
        document.getElementById('ds').value = requerente.ds;
        document.getElementById('grupoMaterial').value = requerente.grupoMaterial;
        document.getElementById('nomeResponsavel').value = requerente.nomeResponsavel;
        document.getElementById('dataPedido').value = requerente.dataPedido;
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

            if (index < dadosObj.length) {
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

function inputsRequestorClean() {
    let ok = confirm(`Tem certeza de que deseja limpar os dados preenchidos no formulário?
Essa ação apagará os campos: 
UNIDADE REQUISITANTE, 
DISTRITO, 
GRUPO DE MATERIAL 
E FUNCIONÁRIO RESPONSÁVEL
`);
    if (ok) {
        document.getElementById('nomeUnidade').value = '';
        document.getElementById('ds').value = '';
        document.getElementById('grupoMaterial').value = '';
        document.getElementById('nomeResponsavel').value = '';
        localStorage.removeItem('dadosRequerente');
    }
};

function inputsItensClean() {
    let ok = confirm(`Tem certeza de que deseja limpar os ITENS PEDIDOS?
Essa ação apagará os campos da coluna: 
ESPECIFICAÇÕES E QUANTIDADE PEDIDA 
`);
    if (ok) {
        let inputs = document.querySelectorAll('#tableItens tbody tr .td__especificacao input, #tableItens tbody tr .td__quant_pedida input');
        inputs.forEach(function (input) {
            input.value = '';
        });
        localStorage.removeItem('dadosItens');
    }
};

function stringParaArray(string) {
    const linhas = string.trim().split('\n');
    return linhas;
};

// Obtém o agente do usuário do navegador
const userAgent = navigator.userAgent;

// Verifica o agente do usuário e define o valor do atributo data-navegador
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


function saveSheetGoogle() {

    const nomeUnidade = document.getElementById('nomeUnidade').value;
    let instantePedido = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    let pedidoInfo = {
        requerente: localStorage.getItem('dadosRequerente'),
        itens: localStorage.getItem('dadosItens'),
        unidade: nomeUnidade.toUpperCase(),
        navegador:  userAgent,
        date: instantePedido,
        requisicao: "salvar",
        Date: ''
    };

    let sheetId = "1ZPSsgOIJJE0p-QT4r2pwVmf4zMtUE5x4FnwnTTig4W0";
    let sheetName = "Sheet1";
    let params = new URLSearchParams(pedidoInfo);
   
    params.append("sheetId", sheetId);
    params.append("sheetName", sheetName);
    fetch(scriptUrl, {
        method: "POST",
        body: params
    }).then(function (response) {
        return response.text();
    })
    .then(function (text) {
        responseFetch(text, instantePedido);

    })
    .catch(function (error) {
        alert(error);
        console.log(error)
    });
};

function responseFetch(text, instantePedido){
    let t = JSON.parse(text);
    let msgEnvioPedido = document.getElementById('msgEnvioPedido');
    msgEnvioPedido.style.backgroundColor = '#4CAF50';
    msgEnvioPedido.style.height =  '35px';
    msgEnvioPedido.style.textAlign = 'center';
    document.querySelector(
        '#msgEnvioPedido').innerHTML =
        `Pedido enviado para planilha. Número Pedido:
         <b>${t.row}</b>. Momento: <b>${instantePedido}</b>`;
    alert(
        `Pedido enviado para planilha. 
        Número Pedido: ${t.row}
        Momento: ${instantePedido}` 
    );    
}


let botaoHabilitado = true;
function desabilitarBotaoEnviar() {
    if (botaoHabilitado) {
    botaoHabilitado = false;
    document.getElementById('btnSendSpreadsheet').disabled = true;
    setTimeout(function() {
        botaoHabilitado = true;
        document.getElementById('btnSendSpreadsheet').disabled = false;
    }, 5000);
    }
}

const nomesUnidades = [
    'USF BONGI BOA IDEA',
    'USF CHICO MENDES/XIMBORÉ',
    'USF COQUEIRAL I E II',
    'USF IRAQUE/RUA DO RIO',
    'USF JARDIM UCHOA',
    'USF JIQUIA I E II',
    'USF MANGUEIRA I',
    'USF MANGUEIRA II',
    'USF PLANETA DOS MACACOS II',
    'USF SAN MARTIN',
    'USF VILA SÃO MIGUEL/MARRON GLACÊ',
    'USF VILA TAMANDARE',
    'CS BIDU KRAUSE',
    'CS GASPAR REGUEIRA COSTA - BARRO',
    'CS PROFESSOR ROMERO MARQUES',
    'UPINHA DIA - BONGI NOVO PRADO',
    'UPINHA JARDIM SÃO PAULO',
    'UPINHA NOVO JIQUIÁ',
    'PAM CEASA',
];

const itensStringConcatenado =
    `
ÓXIDO DE ZINCO
EUGENOL
IONÔMERO DE VIDRO
SUGADOR GENGIVAL
SUGADOR CIRÚRGICO
ADESIVO PARA ESMALTE E DENTINA
CONDICIONADOR ÁCIDO GEL (ÁCIDO FOSFÓRICO 37%)
RESINA A1
RESINA A2
RESINA A3
RESINA A3,5
RESINA B2
ANESTÉSICO LIDOCAÍNA 2% COM VASO
ANESTÉSICO MEPIVACAÍNA 2% COM VASO
ANESTÉSICO MEPIVACAÍNA 3% SEM VASO
ANESTÉSICO PRILOCAÍNA 3% COM VASO
ANESTÉSICO TÓPICO GEL
AGULHA GENGIVAL 30G CURTA
AGULHA GENGIVAL 27G LONGA
FIO DE SUTURA NYLON 4-0
FIO DE SUTURA NYLON 3-0
FIO DE SUTURA SEDA
ROLETES DE ALGODÃO PARA USO ODONTOLÓGICO
TRICRESOLFORMALINA
FORMOCRESOL
OTOSPORIM
EVIDENCIADOR DE PLACA BACTERIANA
BROCA
CIMENTO IRM (LIQUIDO)
CIMENTO IRM (PO)
FLÚOR GEL
PAPEL GRAU CIRÚRGICO P ( rolo - 15CM X 100M)
PAPEL GRAU CIRÚRGICO M ( rolo - 25CM X 100M)
PAPEL GRAU CIRÚRGICO G ( rolo - 40CM X 100M)

ALAVANCA RETA
ALAVANCA CURVA DIREITA
ALAVANCA CURVA ESQUERDA
ALGODÃO EM ROLOS PARA USO ODONTOLOGICO
ALGODAO HIDROFILO EM MANTA 500G
ALVEOLOTOMO CURVO TIPO LUER
ALVEOLOTOMO RETO
AMALGAMADOR TIPO CAPSULA PRE DOSADA
APLICADOR IONOMERO DE VIDRO CAPSULA RIVA
APLICADOR PORTA DYCAL DUPLO
ARCO DE YOUNG, EM PLASTICO
ARCO OSTBY ADULTO PARA ISOLAMENTO ABSOLUTO, DOBRAVEL
ARCO OSTBY INFANTIL PARA ISOLAMENTO ABSOLUTO, DOBRAVEL
AVENTAL DESCARTAVEL (CAPOTE)
BICARBONATO DE SODIO 
BROCA CARBIDE ESFÉRICA Nº4
BROCA CARBIDE ESFERICA Nº8
BROCA CARBIDE FG Nº701
BROCA CARBIDE FG Nº702
BROCA CARBIDE FG Nº703
BROCA CARBIDE Nº 4
BROCA CARBIDE 702 HL
BROCA CIRURGICA ZEKRYA 23MM
BROCA CIRURGICA ZEKRYA 28MM
BROCA 2200 DE ALTA ROTACAO
BROCA 3168F DE ALTA ROTACAO
BROCA CHAMA FG 1111
BROCA CHAMA FG 1111F
BROCA CHAMA FG 1111FF
BROCA CHAMA FG 3118F
BROCA CHAMA FG 3118FF
BROCA CILINDRICA FG 1090G
BROCA CILINDRICA TOPO PLANO FG 1090
BROCA CILINDRICA TOPO PLANO FG 1092
BROCA CILINDRICA TOPO PLANO FG 1092F
BROCA CONE INVERTIDA FG 1034
BROCA CONE-INVERTIDA FG1035
BROCA CONICA DUPLA (CARRETEL) FG 1045
BROCA CONICA DUPLA (CARRETEL) FG1046
BROCA CONICA TOPO EM CHAMA 3195 FF
BROCA CONICA TOPO EM CHAMA 3195F
BROCA CONICA TOPO EM CHAMA FG 1190F
BROCA CONICA TOPO EM CHAMA FG 1190FF
BROCA ESFERICA FG 1012
BROCA ESFERICA FG 1012 HL
BROCA ESFERICA FG 1014
BROCA ESFERICA FG 1014 HL
BROCA ESFERICA FG 1016
BROCA ESFERICA FG 1016HL
BROCA ENDO Z FG Nº 152 21 MM
BROCA GATES GLIDDEN Nº1 DE 32MM
BROCA GATES GLIDDEN Nº2 DE 32MM
BROCA GATES GLIDDEN Nº3 DE 32MM
BROCA GATES Nº 4 DE 32 MM
BROCA GATES Nº 5 (CX C/06UNDS)
BROCA SHOFU TIPO CHAMA DE VELA
BROCA SHOFU TIPO CILINDRICA
BROCA SHOFU TROCO-CONICA PONTA DE LAPIS
BRUNIDOR AMALGAMA Nº 34
BRUNIDOR AMALGAMA Nº 29
CABO DE BISTURI Nº 04, EM ACO INOXIDAVEL
CABO DE BISTURI TIPO BARD PARKER Nº 3
CABO PARA ESPELHO BUCAL Nº5
CAIXA EM ACO INOX COM TAMPA E ALCA 32X22X06CM
CAIXA INOX COM TAMPA 18X08X03CM
CAIXA INOX COM TAMPA 20X10X05
CAIXA INOX COM TAMPA 25X10X05CM
CAIXA INOX COM TAMPA 45 X 08 X 05CM
CAPSULAS DE AMALGAMA DE PRATA PRE DOSADAS
CHAVE UNIVERSAL PARA PONTA DE ULTRASSOM
CIMENTO DE HIDROXIDO DE CALCIO
CIMENTO DE IONOMERO DE VIDRO
CIMENTO DE OXIDO DE ZINCO (PO), EMBALAGEM 50G
CIMENTO FOSFATO DE ZINCO (LIQUIDO) FRASCO 10ML
CIMENTO FOSFATO DE ZINCO (PO) 
CIMENTO IONOMERO DE VIDRO FOTOPOLIMERIZAVEL, ALTA LIBER
CREME DENTAL TEOR DE FLUOR, TUBO 90G
CUBA REDONDA DE ACO INOX DE 8 CM
CUNHA DE MADEIRA ANATOMICAS SORTIDAS - CAIXA C/ 100 UNIDADES
EDTA TRISSODICO GEL CONCENTRACAO DE 24%
EDTA TRISSODICO LIQUIDO, FRASCO C/ 20ML
ESCOVA DE DENTES INFANTIL
ESCOVA DE ROBSON.
ESPELHO BUCAL PLANO Nº5, EM ACO INOX, SEM CABO
ESPONJA HEMOSTATICA OBTIDA DE GELATINA
EUGENOL, FRASCO 20 ML
FIO DE SUTURA NYLON 3.0 
FIO DE SUTURA NYLON 5-0
FIO DE SUTURA NYLON 4-0
FIO DE SUTURA SEDA 3-0
FIO DE SUTURA SEDA 4-0,
FIO DENTAL; SEM SABOR; EMBALAGEM COM 100M
FITA MATRIZ DE ACO INOX 0,05X5X500 MM
FITA MATRIZ DE ACO INOX 0,05X7X500 MM
FLUORETO DE SODIO 2% PH NEUTRO, EM GEL, TEMPO DE ACAO 4 MINUTOS
FORCEPS ADULTO Nº1, ACO INOX.
FORCEPS ADULTO Nº150, ACO INOX.
FORCEPS ADULTO Nº151, ACO INOX.
FORCEPS ADULTO Nº16, ACO INOX.
FORCEPS ADULTO Nº17, ACO INOX.
FORCEPS ADULTO Nº18L, ACO INOX.
FORCEPS ADULTO Nº18R, ACO INOX.
FORCEPS ADULTO Nº65, ACO INOX.
FORCEPS ADULTO Nº68, ACO INOX.
FORCEPS ADULTO Nº69, ACO INOX.
FORCEPS INFANTIL Nº1, ACO INOX.
FORCEPS INFANTIL Nº5, ACO INOX
FORMOCRESOL FRASCO COM 10 ML.
GRAMPO Nº201
GRAMPO Nº202
GRAMPO Nº203
GRAMPO Nº204
GRAMPO Nº205
GRAMPO Nº206
GRAMPO Nº207
GRAMPO Nº208
GRAMPO Nº209
GRAMPO Nº210
GRAMPO Nº211
GRAMPO Nº212
GRAMPO Nº26 
GRAMPO NºW8A
GRAMPO N°203
GRAMPO N°210
GRAMPO Nº200
HIDROXIDO DE CALCIO PRO-ANALISE, POTE C/ 10G
KIT VERNIZ C/ 5% DE FLUORETO DE SODIO
LENCOL DE BORRACHA,QUADRADO 13X13 CM, CX COM 26 UNIDADES.
LIMA C+ LIMA MANUAL N 08 DE 25
LIMA C+ LIMA MANUAL N 10 DE 25MM
LIMA FLEXOFILE MANUAL 1 SERIE: 21MM
LIMA FLEXOFILE MANUAL N 15 DE 25MM
LIMA FLEXOFILE MANUAL N 20 DE 25MM
LIMA FLEXOFILE MANUAL N 25 DE 25MM
LIMA HEDSTROEM 1Âª SERIE 25 MM, CAIXA COM 6 UNIDADES
LIMA PARA OSSO Nº12, EM ACO INOX
LIMA PARA OSSO TIPO BUCK, EM AÇO INOX
LIMA PARA OSSO TIPO SUGARMAN, EM ACO INOX
LIMA TIPO FLEXOFILE 1 SERIE - 25MM
LIMA TIPO HEDSTOEM 1 SERIE - 25MM
LIMA TIPO K 1 SERIE - 25 MM
LIMA TIPO K 2Âª SERIE 25 MM, CAIXA COM 6 UNIDADES
LIMA TIPO K ESPECIAL 06 21MM, CAIXA COM 6 UNIDADES 
LIMA TIPO K ESPECIAL 08 21 MM CAIXA COM 6 UNIDADES
LIMA TIPO K ESPECIAL 08 25 MM CAIXA COM 6 UNIDADES 
LIMA TIPO K ESPECIAL 10 21 MM CAIXA COM 6 UNIDADES 
LIMA TIPO K ESPECIAL 10 25 MM CAIXA COM 6 UNIDADES 
LIMA TIPO K ESPECIAL 15 25 MM CAIXA COM 6 UNIDADES 
LIMA TIPO K N 20 - 25MM
LIMA TIPO K N 25 - 25MM
OCULOS DE PROTECAO
OLEO LUBRIFICANTE PARA CANETA DE ALTA ROTACAO
PAPEL CARBONO PARA ARTICULAÇÃO (DUAS CORES)
PASTA PROFILATICA COM FLUOR
PEDRA DE AFIAR INSTRUMENTAL EM CARBURETO DE SILICIO, DUPLA FACE 15 CM
PINCA PARA ALGODAO Nº 17, EM ACO INOX
PLACA DE VIDRO POLIDA TAMANHO 150X80X06MM (FINA)
PLACA DE VIDRO POLIDA TAMANHO 150X80X10MM (MEDIA)
PONTAS DESCARTAVEIS APLICACAO DE ADESIVO (MICROBRUSH)
PONTAS PARA ULTRASSOM UNIVERSAL
PORTA AMALGAMA, EM PLASTICO AUTOCLAVAVEL
PORTA DETRITOS ODONTOLOGICO EM ACO INOX - DIMENSOE
PORTA MATRIZ TIPO TOFFLEMIRE ADULTO, EM ACO INOX
PORTA MATRIZ TIPO TOFFLEMIRE INFANTIL, EM ACO INOX
POTE DAPPEN DE PLASTICO
POTE DAPPEN DE VIDRO.
REMOVEDOR DE MANCHAS, FRASCO COM 30 ML
RESINA RESTAURADORA DA1
RESINA RESTAURADORA DA2
RESINA RESTAURADORA DA3
RESINA RESTAURADORA EA1
RESINA RESTAURADORA EA2
RESINA RESTAURADORA EA3
RESINA RESTAURADORA EA3,5
RESINA RESTAURADORA EB2
SACA-BROCA UNIVERSAL
SOLUCAO HEMOSTATICA TOPICA
SUGADOR CIRURGICO CAIXA CONTENDO 20 UNIDADES
SUGADOR DE SALIVA DESCARTAVEL, EMBALAGEM 40 UND
TACA DE BORRACHA PARA PROFILAXIA
TIRA DE ACO ABRASIVA PARA AMALGAMA (LIXA DE ACO)
TIRA DE LIXA PARA POLIMENTO E ACABAMENTO CX 150 TIRAS
TIRA DE POLIESTER DE 100X10X0,05MM CAIXA COM 50 TIRAS.
TRICRESOLFORMALINA FRASCO COM 10 ML
VASELINA SOLIDA TUBO COM 25 G
`;

/*

IMPLEMENTAÇÕES FUTURAS:
[X] adicionar icone lado direito
[X] alterar background do input para ficar visível para preenchimento
[X] salvar no local storage inputs da unidade requerente.
[X] salvar no local storage inputs dos itens.
[X] diminuir fonte dos itens na coluna especificação para se adequar ao imprimir
[X] fetch post em uma planilha google.

[X] fazer get de uma linha da planilha
[X] alterar exibição do botão imprimir no evento de click
[X] adicionar botão ENVIAR PEDIDO - que enviar pedido para planilha retorna mensagem de pedido enviado.
[] fazer get de uma determinada coluna da planilha

[] mover lista de itens para um arquivo externo ao index.js
[] implementar download de arquivo json com os dados preenchidos nos inputs
[] implementar upload de arquivo json para preencher input
[] mensagem no rodapé do desenvolvedor na pagina
[] implementar botão para salvar em pdf em nova aba.



LINK ÚTEIS
// https://igorescobar.github.io/jQuery-Mask-Plugin/docs.html

*/



// TESTE GERAR PDF

function gerarTabelaPDF(pdf, dados, columns, startX, startY) {
    const margin = 10;
    const cellWidth = (pdf.internal.pageSize.getWidth() - margin * 2) / columns.length;
    const cellHeight = 15;

    pdf.setFillColor(204, 204, 204);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontStyle("bold");

    // Cabeçalho da tabela
    pdf.rect(startX, startY, pdf.internal.pageSize.getWidth() - margin * 2, cellHeight, "F");
    for (let i = 0; i < columns.length; i++) {
        pdf.text(startX + i * cellWidth, startY + cellHeight / 2, columns[i]);
    }

    pdf.setFontStyle("normal");

    // Dados da tabela
    for (let row = 0; row < dados.length; row++) {
        for (let col = 0; col < columns.length; col++) {
            pdf.text(startX + col * cellWidth, startY + (row + 1) * cellHeight, String(dados[row][col]));
        }
    }

    return startY + (dados.length + 1) * cellHeight;
}
  
function gerarPDF() {
    let pdf = new jsPDF();

    // Adiciona o cabeçalho do PDF
    pdf.setFont("Times", "bold", 16);
    pdf.text("Nota de Requisição e Saída de Material", 10, 10);

    // Adiciona os dados do formulário
    pdf.setFont("Times", "normal", 10);

    // Dados da requisição
    pdf.text("Unidade Requisitante: " + document.querySelector("#nomeUnidade").value, 10, 40);
    pdf.text("Distrito Sanitário: " + document.querySelector("#ds").value, 10, 50);
    pdf.text("Data: " + document.querySelector("#dataPedidoShowPrint").value, 10, 60);

    // Dados do material
    let especificacoesInputs = document.querySelectorAll(".td__especificacao input");
    let quantPedidaInputs = document.querySelectorAll(".td__quant_pedida input");

    // Cria um array para armazenar os dados da tabela
    let tableData = [];
    for (let i = 0; i < especificacoesInputs.length; i++) {
        let especificacao = especificacoesInputs[i].value;
        let quantidade = quantPedidaInputs[i].value;
        tableData.push([especificacao, quantidade]);
    }

    // Configuração da tabela
    let columns = ["Especificações", "Quantidade"];
    let startY = 70;  // Posição inicial da tabela
    startY = gerarTabelaPDF(pdf, tableData, columns, 10, startY);

    // Salva o arquivo PDF
    pdf.save("nota-requisicao.pdf");
}

$(document).ready(function () {
    $('#buttonPDF').click(function () {
        gerarPDF();
    });
});


// https://mrrio.github.io/jsPDF/examples/basic.html
function savePDF() {
    let data = new Date();
    let pdf = new jsPDF('p', 'pt', 'letter')
        , source = $('body')[0]

        , specialElementHandlers = {
            '#divLeft': function (element, renderer) {
                return true
            }
        }

    margins = {
        top: 80,
        bottom: 60,
        left: 40,
        width: 522
    };
    pdf.fromHTML(
        source // HTML string or DOM elem ref.
        , margins.left // x coord
        , margins.top // y coord
        , {
            'width': margins.width
            , 'elementHandlers': specialElementHandlers
        },
        function (dispose) {
            pdf.save("Relatorio - " + data.getDate() + "/" + data.getMonth() + "/" + data.getFullYear() + ".pdf");
        },
        margins
    )
}

$(document).ready(function(){
    $('#btnPDF').click(function() {
      savePDF();
    });
});