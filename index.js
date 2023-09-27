document.getElementById("titleCenter").innerHTML = "<b>NOTA DE REQUISIÇÃO E SAÍDA DE MATERIAL</b>";

const datalist = document.getElementById("item-list");
const undlist = document.getElementById("u-list")
let nomeUnidade = document.getElementById("nomeUnidade");

let requerenteForm;
let itensForm;

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
    var dados = [];
    // Iterar por todas as linhas de input
    var linhas = document.querySelectorAll('#tableItens tbody tr');
    linhas.forEach(function (linha, index) {
        var inputEspecificacao = linha.querySelector('.td__especificacao input');
        var inputQuantidade = linha.querySelector('.td__quant_pedida input');
        var item = {
            especificacao: inputEspecificacao.value,
            quantidade: inputQuantidade.value
        };
        dados.push(item);
    });
    localStorage.setItem('dadosItens', JSON.stringify(dados));
};

// Adiciona um evento 'input' para salvar os dados no Local Storage automaticamente
var inputs = document.querySelectorAll('#tableItens tbody tr .td__especificacao input, #tableItens tbody tr .td__quant_pedida input');
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
    }
};

function recuperarDadosItensLocalStorage() {
    let dadosJSON = localStorage.getItem('dadosItens');
    if (dadosJSON) {
        let dadosObj = JSON.parse(dadosJSON);

        // Iterar pelos dados e preencher os inputs correspondentes
        var linhas = document.querySelectorAll('#tableItens tbody tr');
        linhas.forEach(function (linha, index) {
            var inputEspecificacao = linha.querySelector('.td__especificacao input');
            var inputQuantidade = linha.querySelector('.td__quant_pedida input');

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
        var inputs = document.querySelectorAll('#tableItens tbody tr .td__especificacao input, #tableItens tbody tr .td__quant_pedida input');
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

    let pedidoInfo = {
        requerente: localStorage.getItem('dadosRequerente'),
        itens: localStorage.getItem('dadosItens')
    };
    console.log(pedidoInfo);

    var sheetId = "1ZPSsgOIJJE0p-QT4r2pwVmf4zMtUE5x4FnwnTTig4W0";
    var sheetName = "Sheet1";
    var scriptUrl = "https://script.google.com/macros/s/AKfycbw3Av8e3v9kM51mDRT4-0HF-0QzaS_bGpO-PaBs2edJX4HL1UrCtv4cwKadnsEain7OWQ/exec";

    var params = new URLSearchParams(pedidoInfo);
    console.log(params)
    params.append("sheetId", sheetId);
    params.append("sheetName", sheetName);
    fetch(scriptUrl, {
        method: "POST",
        body: params
    }).then(function (response) {
        return response.text();
    })
    .then(function (text) {
        alert(text);
    })
    .catch(function (error) {
        alert(error);
    });
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
BROCA ENDO Z FG NÂº 152 21 MM
BROCA GATES GLIDDEN NÂº1 DE 32MM
BROCA GATES GLIDDEN NÂº2 DE 32MM
BROCA GATES GLIDDEN NÂº3 DE 32MM
BROCA GATES NÂº 4 DE 32 MM
BROCA GATES NÂº 5 (CX C/06UNDS)
BROCA SHOFU TIPO CHAMA DE VELA
BROCA SHOFU TIPO CILINDRICA
BROCA SHOFU TROCO-CONICA PONTA DE LAPIS
BRUNIDOR AMALGAMA N 34
BRUNIDOR AMALGAMA Nº29
CABO DE BISTURI NÂº 04, EM ACO INOXIDAVEL
CABO DE BISTURI TIPO BARD PARKER NÂº 3
CABO PARA ESPELHO BUCAL NÂº5
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
FORCEPS ADULTO NÂº1, ACO INOX.
FORCEPS ADULTO NÂº150, ACO INOX.
FORCEPS ADULTO NÂº151, ACO INOX.
FORCEPS ADULTO NÂº16, ACO INOX.
FORCEPS ADULTO NÂº17, ACO INOX.
FORCEPS ADULTO NÂº18L, ACO INOX.
FORCEPS ADULTO NÂº18R, ACO INOX.
FORCEPS ADULTO NÂº65, ACO INOX.
FORCEPS ADULTO NÂº68, ACO INOX.
FORCEPS ADULTO NÂº69, ACO INOX.
FORCEPS INFANTIL NÂº1, ACO INOX.
FORCEPS INFANTIL NÂº5, ACO INOX
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
GRAMPO N° 203
GRAMPO ' NÂ° 210
GRAMPO ' NÂº200, EM ACO INOX
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
LIMA PARA OSSO NÂº12, EM ACO INOX
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
PINCA PARA ALGODAO NÂº 17, EM ACO INOX
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

[] fetch post em uma planilha google.
[] mover lista de itens para um arquivo externo ao index.js
[] implementar download de arquivo json com os dados preenchidos nos inputs
[] implementar upload de arquivo json para preencher input
[] mensagem no rodapé do desenvolvedor na pagina
[] implementar botão para salvar em pdf em nova aba.



LINK ÚTEIS
// https://igorescobar.github.io/jQuery-Mask-Plugin/docs.html

*/