const sheetName = 'Sheet1';
const scriptProp = PropertiesService.getScriptProperties();
const urlSpreadSheet = 'URL_PLANILHA';
const spreadSheetID = 'ID_PLANILHA';
const sheets = SpreadsheetApp.openByUrl(urlSpreadSheet);
const sheet = sheets.getSheetByName(sheetName);
const spreadsheetAppId = SpreadsheetApp.openById(spreadSheetID);

// apps-script-google-planilha-requisicao-material v6

// POST
const doPost = (e) => {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const doc = spreadsheetAppId;
    // const sheet = doc.getSheetByName(sheetName);
    const sheet = doc.getSheetByName(e.parameter['sheetName']);   

    if (e.parameter['requisicao'] == 'salvar') {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      // const newRow = headers.map((header) => {
      //   return header === 'Date' ? new Date() : e.parameter[header];
      // });
      const newRow = headers.map((header) => {
        if (header === 'Date') {
          return new Date();
        } else if (header === 'ID') {
          return '=row()'; 
        } else {
          return e.parameter[header];
        }
      });
      const nextRow = sheet.getLastRow() + 1;
      sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
      return ContentService
        .createTextOutput(JSON.stringify(
          { 'result': 'success', 'row': nextRow }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      const dados = JSON.parse(e.postData.contents);
      if (dados.requisicao == 'obter') {
        return ContentService.createTextOutput(
          JSON.stringify(
            SpreadsheetApp.openByUrl(dados.link)
              .getSheetByName(dados.pagina)
              .getRange(dados.celulas)
              .getValues()
          )
        );
      } 
      if (dados.requisicao == 'ultimopedido') {
        return ContentService.createTextOutput(
          JSON.stringify(
            sheet.getLastRow()
          )
        );
      } else {
        return ContentService.createTextOutput(
          JSON.stringify({
            text: "tipo de requisicao invalida",
            "parameter": e.parameter[header]
          })).setMimeType(ContentService.MimeType.JSON);
      }
    }

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', error }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// GET PARAMETROS
// ?id=&search=
// ?page=&perPage=
// ?search=pesquisarIntervalo&startId=&endId=

// GET
function doGet(e) {
  const pesquisaId = e.parameter['id'] || "";
  const pesquisaTxt = e.parameter['search'] || "";
  const page = parseInt(e.parameter['page']) || 1;
  const perPage = parseInt(e.parameter['perPage']) || 20;
  const inicial = parseInt(e.parameter['startId'] || 1);
  const final = parseInt(e.parameter['endId'] || 1);  

  if(pesquisaId !== "") {
    let pedido = buscarPorId(pesquisaId);
    return ContentService.createTextOutput(
      JSON.stringify(pedido)).setMimeType(ContentService.MimeType.JSON);
  }

  if (pesquisaTxt == "" || pesquisaTxt === null) {
    let listPage = retornarItensPaginadosOrdemInversa(page, perPage);
    Logger.log(JSON.stringify(listPage));
    return ContentService.createTextOutput(
      JSON.stringify(listPage)).setMimeType(ContentService.MimeType.JSON);
  }

  if (pesquisaTxt == 'pesquisarIntervalo') {
    let lista = retornarItensIntervalo(inicial, final);
    return ContentService.createTextOutput(
      JSON.stringify(lista)).setMimeType(ContentService.MimeType.JSON);
  }

  if (pesquisaTxt != "" ) {
    let allResults = encontrarTextoNaColuna(pesquisaTxt);
    allResults.sort((a, b) => b.id - a.id);
    let totalResults = allResults.length;

    let resultString = JSON.stringify({
      totalResults: totalResults,
      pesquisa: pesquisaTxt,
      results: allResults    
    });
    return ContentService.createTextOutput(resultString)
      .setMimeType(ContentService.MimeType.JSON);
  }  
}

function buscarPorId(id) {
  let planilhaId = spreadSheetID;
  let planilha = SpreadsheetApp.openById(planilhaId);
  let guia = planilha.getSheetByName(sheetName); 
  let linha = id;
  let objeto;
  
  let lastRow = sheet.getLastRow();
  if (lastRow < id) {
    throw new Error("Id não encontrado.");
  }

  let valorColunaA = guia.getRange("A" + linha).getValue();
  let valorColunaB = guia.getRange("B" + linha).getValue();
  let valorColunaC = guia.getRange("C" + linha).getValue();
  let valorColunaD = guia.getRange("D" + linha).getValue();
  let valorColunaE = guia.getRange("E" + linha).getValue();
  let valorColunaF = guia.getRange("F" + linha).getValue();

  let requisitanteStr = valorColunaD;
  let requisitante = JSON.parse(requisitanteStr);
  let itensString = guia.getRange("E" + linha).getValue();
  let itens = JSON.parse(itensString);

    objeto = {
      id: valorColunaA,
      dataPedido: valorColunaB,
      nomeUnidade: valorColunaC,
      requisitanteStr: valorColunaD,
      itensStr: valorColunaE,      
      tipoPedido: valorColunaF,
      requisitante: requisitante,
      itens: itens,
    }; 

  return objeto;
}

function encontrarTextoNaFolha(str) {
   let planilha = SpreadsheetApp.openById(spreadSheetID);

  let guia = planilha.getSheetByName(sheetName);
  let textoParaEncontrar = str;
  let textFinder = guia.createTextFinder(textoParaEncontrar);
  let resultados = textFinder.findAll();
  let listaDeObjetos = [];
  for (let i = 0; i < resultados.length; i++) {
    let resultado = resultados[i];
    let linha = resultado.getRow();
    let valorColunaA = guia.getRange("A" + linha).getValue();
    let valorColunaB = guia.getRange("B" + linha).getValue();
    let valorColunaC = guia.getRange("C" + linha).getValue();
    let valorColunaF = guia.getRange("F" + linha).getValue();
    let objeto = {
      A: valorColunaA,
      B: valorColunaB,
      C: valorColunaC,
      F: valorColunaF
    };
    Logger.log('Resultado Pesquisa: '+ valorColunaA+' : '+valorColunaC);
    if (!listaDeObjetos.some(item => JSON.stringify(item) === JSON.stringify(objeto))) {
      listaDeObjetos.push(objeto);
    }
  }
  return listaDeObjetos;
  
}

function encontrarTextoNaColuna(str) {
  let planilhaId = spreadSheetID;
  let planilha = SpreadsheetApp.openById(planilhaId);
  let guia = planilha.getSheetByName(sheetName);  
  let colunaParaPesquisar = "C";  
  let textoParaEncontrar = str;
  let textFinder = guia.getRange(colunaParaPesquisar + ":" + colunaParaPesquisar)
      .createTextFinder(textoParaEncontrar);
  let resultados = textFinder.findAll();

  if (resultados.length == 0){
    throw new Error("Nenhum objeto encontrado.");
  }

  let listaDeObjetos = [];
  for (let i = 0; i < resultados.length; i++) {
    let resultado = resultados[i];
    let linha = resultado.getRow();
    if (linha == 1) {
      continue; // Pule a linha de cabeçalho
    }
    let valorColunaA = guia.getRange("A" + linha).getValue();
    let valorColunaB = guia.getRange("B" + linha).getValue();
    let valorColunaC = guia.getRange("C" + linha).getValue();
    let valorColunaF = guia.getRange("F" + linha).getValue();
    let objeto = {
      id: valorColunaA,
      dataPedido: valorColunaB,
      nomeUnidade: valorColunaC,
      tipoPedido: valorColunaF
    };   
    Logger.log('Resultado Pesquisa: '+ valorColunaA+' : '+valorColunaC);
    listaDeObjetos.push(objeto);    
  }
  return listaDeObjetos;
}

function retornarItensPaginados(paginaAtual, elementosPorPagina) {
  let lastRow = sheet.getLastRow();

  let totalPaginas = Math.ceil(lastRow / elementosPorPagina);

  if (paginaAtual < 1 || paginaAtual > totalPaginas || paginaAtual < 0) {
    throw new Error("Página fora do limite.");
  }

  let maxInicio = (paginaAtual - 1) * elementosPorPagina + 1;
  let maxFim = maxInicio + elementosPorPagina - 1;

  // Certifica-se de que os índices não ultrapassem o último elemento
  maxFim = Math.min(maxFim, lastRow);

  let range = sheet.getRange(maxInicio, 1, maxFim - maxInicio + 1, 3);
  let values = range.getValues();
  let result = [];
  for (let row = 0; row < values.length; row++) {
    let rowData = {};
    rowData.id = values[row][0];
    rowData.dataPedido = values[row][1];
    rowData.nomeUnidade = values[row][2];
    result.push(rowData);
  }

  return {   
    paginaAtual: paginaAtual,
    totalPaginas: totalPaginas,
    elementosPorPagina: elementosPorPagina,
    totalElementos: lastRow,
    data: result
  };
}

function retornarItensPaginadosOrdemInversa(paginaAtual, elementosPorPagina) {
  let lastRow = sheet.getLastRow();

  let totalPaginas = Math.ceil(lastRow / elementosPorPagina);

  if (paginaAtual < 1 || paginaAtual > totalPaginas || paginaAtual < 0) {
    throw new Error("Página fora do limite.");
  }

  let maxFim = lastRow - (paginaAtual - 1) * elementosPorPagina;
  let maxInicio = maxFim - elementosPorPagina + 1;

  // Certificar que os índices não ultrapassem o primeiro elemento
  maxInicio = Math.max(maxInicio, 1);

  let range = sheet.getRange(maxInicio, 1, maxFim - maxInicio + 1, 3);
  let values = range.getValues();
  let result = [];
  for (let row = 0; row < values.length; row++) {
    let rowData = {};
    rowData.id = values[row][0];
    rowData.dataPedido = values[row][1];
    rowData.nomeUnidade = values[row][2];
    result.push(rowData);
  }

  // Ordene o array result em ordem decrescente com base no ID
  result.sort((a, b) => b.id - a.id);

  return {
    pageNumber: paginaAtual,
    totalPages: totalPaginas,
    pageSize: elementosPorPagina,
    totalRows: lastRow,
    data: result
  };
}

function retornarItensIntervalo(inicio, fim) {
  let lastRow = sheet.getLastRow();
  let maxInicio = Math.min(inicio, lastRow);
  let maxFim = Math.min(fim, lastRow);
  if (maxInicio > maxFim) {
    throw new Error(
      `O parâmetro inicio não pode ser maior que o parâmetro fim, inicio: ${maxInicio}, fim: ${maxFim}`
      );
  }
  if (maxInicio == 1) {
    maxInicio = lastRow - 9;
    maxFim = lastRow;
  }
  
  let range = sheet.getRange(maxInicio, 1, maxFim - maxInicio + 1, 3);
  let values = range.getValues();
  let result = [];
  for (let row = 0; row < values.length; row++) {
    let rowData = {};
    rowData.id = values[row][0];
    rowData.dataPedido = values[row][1];
    rowData.nomeUnidade = values[row][2];
    result.push(rowData);
  }
  
  return {
    totalElementos: lastRow,
    function: 'retornarItensIntervalo',
    data: result    
  };
}

function retornarTodosColunasABC() {
  var range = sheet.getRange(2, 1, sheet.getLastRow(), 3);
  var values = range.getValues();
  var result = [];
  for (var row in values) {
    var rowData = {};
    rowData.id = values[row][0];
    rowData.dataPedido = values[row][1];
    rowData.nomeUnidade = values[row][2];
    result.push(rowData);
  }
  return result;
}

function ultimaLinha() {
  return sheet.getLastRow();
}