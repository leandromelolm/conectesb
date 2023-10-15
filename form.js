// Coloque aqui o ID da sua planilha do Google
// https://docs.google.com/spreadsheets/d/1ZPSsgOIJJE0p-QT4r2pwVmf4zMtUE5x4FnwnTTig4W0/edit?pli=1#gid=0
var sheetId = "1ZPSsgOIJJE0p-QT4r2pwVmf4zMtUE5x4FnwnTTig4W0";

// Coloque aqui o nome da aba da sua planilha do Google
var sheetName = "Sheet1";

// Coloque aqui a URL do seu script do Google Apps Script que faz o fetch
var scriptUrl = "https://script.google.com/macros/s/AKfycbw3Av8e3v9kM51mDRT4-0HF-0QzaS_bGpO-PaBs2edJX4HL1UrCtv4cwKadnsEain7OWQ/exec";

// Seleciona o formulário pelo seu ID
var form = document.getElementById("myForm");

// Adiciona um evento de submit ao formulário
form.addEventListener("submit", function(event) {
    // Previne o comportamento padrão do formulário (recarregar a página)
    event.preventDefault();
    
    // Cria um objeto FormData com os dados do formulário
    var formData = new FormData(form);

    // Cria um objeto URLSearchParams com os dados do FormData
    var params = new URLSearchParams(formData);

    // Adiciona o ID e o nome da planilha aos parâmetros
    params.append("sheetId", sheetId);
    params.append("sheetName", sheetName);

    // Cria uma requisição fetch para o script do Google Apps Script
    fetch(scriptUrl, {
        method: "POST",
        body: params
    })
    .then(function(response) {
        // Converte a resposta em texto
        return response.text();
    })
    .then(function(text) {
        // Mostra a resposta na tela
        alert(text);
        limparForm()
    })
    .catch(function(error) {
        // Mostra o erro na tela
        alert(error);
    });
});

function limparForm(){
    document.getElementById('name').value = '';
    document.getElementById('quant').value = '';
}

function setDataAtual() {
    var data = new Date();
    var ano = data.getFullYear();
    var mes = data.getMonth() + 1;
    var dia = data.getDate();
    if (mes < 10) { // se o mês for menor que 10, adiciona um zero à esquerda
    mes = "0" + mes;
    }
    if (dia < 10) { // se o dia for menor que 10, adiciona um zero à esquerda
    dia = "0" + dia;
    }
    var dataAtual = ano + "-" + mes + "-" + dia;
    document.getElementById("data").value = dataAtual;
}


window.onload = () => {
    const datalist = document.getElementById("item-list");
    const undlist = document.getElementById("u-list");
    let itemArray = stringParaArray(itensStringConcatenado);
    itemArray.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        datalist.appendChild(optionElement);
    });

    setDataAtual();
    getSheetData('ultimopedido', '');
    
};

function stringParaArray(string) {
    const linhas = string.trim().split('\n');
    return linhas;
};

function enviarFormulario(event) {
    event.preventDefault();
    const unidadeRequisitante = document.getElementById('unidadeRequisitante').value  
    const itensDados = document.getElementById('listaPedido').value;
    localStorage.setItem('dadosRequerente', unidadeRequisitante)
    localStorage.setItem('dadosItens', itensDados);
}

function limparCampos() {
    document.getElementById('unidadeRequisitante').value = '';
    document.getElementById('listaPedido').value = '';
}

const formularioPequisa = document.getElementById('search-form');
formularioPequisa.addEventListener('submit', e => {
    e.preventDefault()
    pesquisar();   
})

let ultimoPedido;
function pesquisar(){
    let txtLinhaPesquisada = document.getElementById("textoPesquisado").value;
    let txtlinhaFormatada = `A${txtLinhaPesquisada}:E${txtLinhaPesquisada}`;
    if(!txtLinhaPesquisada == ''){
        getSheetData('obter', txtlinhaFormatada);
    }
    else{
        getSheetData('obter', `A${ultimoPedido -20}:B${ultimoPedido}`);
    }
   
    desabilitarBotaoPesquisa(); // desabilita por 3 segundos
};

function getSheetData(tipoRequisicao, obterCelulas){  
    const linkScriptv16 = 'https://script.google.com/macros/s/AKfycbyTH5vqL7NNn0qYTr6gIu-OshjKhMZGDMewxK16ITQTshDuy1QebjhHRFgvQA9Dol6hGw/exec';
    const linkPlanilha = 'https://docs.google.com/spreadsheets/d/1ZPSsgOIJJE0p-QT4r2pwVmf4zMtUE5x4FnwnTTig4W0/edit#gid=0'
    fetch(linkScriptv16, {
        method: 'POST',
        body: JSON.stringify({
          link: linkPlanilha,
          pagina: 'sheet1',
          celulas: obterCelulas,
          requisicao: tipoRequisicao,
        }),    
    })
    .then((dados) => dados.json()) 
    .then((dados) => verificarDados(dados));    
};

function verificarDados(dados){  
    if(typeof dados === 'number'){
        document.querySelector('#numeroUltimoPedido').innerHTML = `Ultimo pedido: ${dados}`;
        ultimoPedido = dados;
    }
    console.log(dados);
    let data = dados;
    if(data[0]){
        document.getElementById('dataPedido').innerHTML = data[0][0];
        document.getElementById('requisitante').innerHTML = data[0][1];
        document.getElementById('dadosRequisitante').innerHTML = data[0][2];
        document.getElementById('pedido').innerHTML = data[0][3];

        document.getElementById('unidadeRequisitante').value = data[0][2];
        document.getElementById('listaPedido').value = data[0][3];

        if(!data[0][3]){
            criarTabela(data);
        }
    }
};

let botaoHabilitado = true;

function desabilitarBotaoPesquisa() {
    if (botaoHabilitado) {
    botaoHabilitado = false;
    document.getElementById('btnPesquisa').disabled = true;
    setTimeout(function() {
        botaoHabilitado = true;
        document.getElementById('btnPesquisa').disabled = false;
    }, 3000);
    }
}

function criarTabela(arr) {
    let ordem = ultimoPedido-20;

    document.getElementById('tabela').innerHTML = "";
    const tabelaDiv = document.getElementById('tabela');
    const table = document.createElement('table');
    table.className = 'table';
    const thead = document.createElement('thead');
    const theadRow = document.createElement('tr');
    const ordemHeader = document.createElement('th');
    ordemHeader.textContent = 'Ordem';
    const dataHeader = document.createElement('th');
    dataHeader.textContent = 'Data';
    const unidadeHeader = document.createElement('th');
    unidadeHeader.textContent = 'Unidade';

    theadRow.appendChild(ordemHeader);
    theadRow.appendChild(dataHeader);
    theadRow.appendChild(unidadeHeader);
    thead.appendChild(theadRow);
    table.appendChild(thead);

    for (let i = 0; i < arr.length; i++) {
      const row = document.createElement('tr');
      const numeroCelula = document.createElement('td');     
      numeroCelula.textContent = ordem;
      ordem++

      row.appendChild(numeroCelula);
      for (let j = 0; j < arr[i].length; j++) {
        const cell = document.createElement('td');
        cell.appendChild(document.createTextNode(arr[i][j]));
        row.appendChild(cell);
      }  
      table.appendChild(row);
    }  
    tabelaDiv.appendChild(table);
  }


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