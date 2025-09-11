/** v28 - gas pedido fazer listar **/
const urlSpreadSheet = infoPlanilha().urlPlanilha;
const spreadSheetID = infoPlanilha().idPlanilha;
const sheetName = infoPlanilha().folhaDePedidos;
const sheets = SpreadsheetApp.openByUrl(urlSpreadSheet);
const sheet = sheets.getSheetByName(sheetName);
const spreadsheetId = SpreadsheetApp.openById(spreadSheetID);

const sheetUser = sheets.getSheetByName(infoPlanilha().folhaDeUsuarios);


// POST
const doPost = (e) => {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const doc = spreadsheetId;
    const sheet = doc.getSheetByName(e.parameter['sheetName']);
    if (e.parameter['requisicao'] == 'salvar') {
      let largerId = Math.max.apply(null, sheet.getRange("A2:A").getValues());
      let newId = largerId +1;

      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const newRow = headers.map((header) => {
        if (header === 'Date') {
          return new Date();
        } else if (header === 'ID') {      
          return newId; 
        } else {
          return e.parameter[header];
        }
      });
      const nextRow = sheet.getLastRow() + 1;
      sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
      return ContentService
        .createTextOutput(JSON.stringify(
          { 'result': 'success', 'row': newId}))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({
          text: "tipo de requisicao invalida",
          "parameter": e.parameter[header]
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify(
        { 'result': 'error', error }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// GET
function doGet(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
  const pesquisaId = e.parameter['id'] || "";
  const pesquisaTxt = e.parameter['search'] || "";
  const page = parseInt(e.parameter['page']) || 1;
  const perPage = parseInt(e.parameter['perPage']) || 20;
  const inicial = parseInt(e.parameter['startId'] || 1);
  const final = parseInt(e.parameter['endId'] || 1);  
  const searchKey = e.parameter['search_key'] || "";
  const distrito = e.parameter['distrito'] || '';
  const grupoMaterial = e.parameter['grupo'] || '';
  const action = e.parameter['action'] || '';
  const ultimoPedidoId = e.parameter['id_ultimo_pedido'] || 1;
  const quantidadeDePedidos = e.parameter['quantidade_de_pedidos'] || 20;

  if(action == 'listadepedidoscomitens')
    return listaDePedidosComItens(ultimoPedidoId, quantidadeDePedidos);

  if(searchKey === sheetUser.getRange("F2").getValue()){
    let encontrado = findBySheet(pesquisaTxt)
    return ContentService.createTextOutput(
      JSON.stringify({
        search: pesquisaTxt,
        size: encontrado.length,
        content: encontrado
      })).setMimeType(ContentService.MimeType.JSON);
  }

  if(pesquisaId !== "") {
    let pedido = buscarPorId(pesquisaId);
    return ContentService.createTextOutput(
      JSON.stringify(pedido)).setMimeType(ContentService.MimeType.JSON);
  }

  if (pesquisaTxt == "" || pesquisaTxt === null) {
    let listPage = retornarItensPaginadosOrdemInversa(page, perPage, distrito, grupoMaterial);
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
    let allResults = findByColumn(pesquisaTxt);
    if (allResults.resultSize == 0){
      return ContentService.createTextOutput(
        JSON.stringify(
          allResults
        )).setMimeType(ContentService.MimeType.JSON);
    }
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

  } catch (error) {
  return ContentService
      .createTextOutput(JSON.stringify(
        { 'result': 'error', 'message': error }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  } 

}

function isDigit(n) {
    return /^\d+$/.test(n)
}

function buscarPorId(id) {
  if(!isDigit(id)){
    throw  obj = {
      statusCode: 422,
      message: `Id da pesquisa não é um número inteiro válido. ID: ${id}`,
      status: "Unprocessable Entity",
      details: ""
    };
  }
  let planilhaId = spreadSheetID;
  let planilha = SpreadsheetApp.openById(planilhaId);
  let guia = planilha.getSheetByName(sheetName); 
  let linha = id;
  let objeto;  
  let lastRow = sheet.getLastRow();
  if (lastRow < id || id < 2) {
    throw  obj = {
      statusCode: 404,
      message: `ID de pedido não encontrado. ID: ${id}`,
      status: "Object Not Found",
      details: ""
    };
  }
  let valorColunaA = guia.getRange("A" + linha).getValue();
  let valorColunaB = guia.getRange("B" + linha).getValue();
  let valorColunaC = guia.getRange("C" + linha).getValue();
  let valorColunaD = guia.getRange("D" + linha).getValue();
  let valorColunaE = guia.getRange("E" + linha).getValue();
  let valorColunaF = guia.getRange("F" + linha).getValue();
  let valorColunaI = guia.getRange("I" + linha).getValue();
  let requisitante = JSON.parse(valorColunaD);
  let itens = JSON.parse(valorColunaE);
  objeto = {
    id: valorColunaA,
    dataPedido: valorColunaB,
    nomeUnidade: valorColunaC, 
    tipoPedido: valorColunaF,
    requisitante: requisitante,
    itens: itens,
    qtdItens: valorColunaI
  }; 
  return objeto;
}

/** Encontrar na Coluna **/
function findByColumn(str) {
  let planilhaId = spreadSheetID;
  let planilha = SpreadsheetApp.openById(planilhaId);
  let guia = planilha.getSheetByName(sheetName);  
  let colunaParaPesquisar = "C";  
  let textoParaEncontrar = str;
  let textFinder = guia.getRange(colunaParaPesquisar + ":" + colunaParaPesquisar)
      .createTextFinder(textoParaEncontrar);
  let resultados = textFinder.findAll();

  if (resultados.length == 0){
    throw  error = {
      statusCode: 404,
      message: `Nenhum resultado encontrado. Pesquisa: ${str}`,
      status: "Object Not Found",
      details: ""
    };
  }
  let listaDeObjetos = [];
  for (let i = 0; i < resultados.length; i++) {
    let resultado = resultados[i];
    let linha = resultado.getRow();
    if (linha == 1) {
      continue; // Pule a linha de cabeçalho
    }
    let colA = guia.getRange("A" + linha).getValue();
    let colB = guia.getRange("B" + linha).getValue();
    let colC = guia.getRange("C" + linha).getValue();
    let colF = guia.getRange("F" + linha).getValue();
    let colI = guia.getRange("I" + linha).getValue();
    
    const colD = guia.getRange("D"+linha).getValue();
    const requerente = JSON.parse(colD);

    let objeto = {
      id: colA,
      dataPedido: colB,
      nomeUnidade: colC,
      tipoPedido: colF,
      equipe: requerente.equipe,
      distrito: requerente.ds,
      grupoMaterial: requerente.grupoMaterial,
      qtdItens: colI
    };
    listaDeObjetos.push(objeto);    
  }
  return listaDeObjetos;
}

/**
 * Função Principal que retonar a lista de pedidos.
 * Ordem id decrescente. Página 1 retorna os pedidos mais recentes.
 * O pedido exibido na lista contém informação da quantidade de itens do pedido
 * **/
function retornarItensPaginadosOrdemInversa(paginaAtual, elementosPorPagina, distrito, grupoMaterial) {
  let ultimoElemento = sheet.getLastRow();
  const totalItens = ultimoElemento -1;

  let result = [];
  if (distrito === "" && grupoMaterial === "") {
    const { totalElementos, totalPaginas, elemInicio, elemFim } = calcularPaginacaoListaCompleta(paginaAtual, elementosPorPagina, totalItens);
    // getRange(row, column, numRows, numColumns);
    // elemInicio + 1 pois a lista se inicia na linha 2
    let range = sheet.getRange(elemInicio + 1, 1, elemFim - elemInicio + 1, 9);    
    let values = range.getValues();
    for (let row = 0; row < values.length; row++) {
      let unidadeRequisitante = JSON.parse(values[row][3]);    
      let rowData = {};
      rowData.id = values[row][0];
      rowData.dataPedido = values[row][1];
      rowData.nomeUnidade = values[row][2];
      rowData.equipe = unidadeRequisitante.equipe || "-";
      rowData.distrito = unidadeRequisitante.ds || '';
      rowData.grupoMaterial = unidadeRequisitante.grupoMaterial || '';
      rowData.qtdItensNoPedido = values[row][8];
      result.push(rowData);
    }
    result.sort((a, b) => b.id - a.id);
    return {
      pageNumber: paginaAtual,
      totalPages: totalPaginas,
      pageSize: elementosPorPagina,
      totalElements: totalElementos,
      data: result
    };
  } 

  if (distrito !== "") {
    let range = sheet.getRange(2, 1, ultimoElemento -1, 9);
    // getRange(row, column, numRows, numColumns);
    let values = range.getValues();
      for (let row = 0; row < values.length; row++) {
        let unidadeRequisitante = JSON.parse(values[row][3]); 
        if(distrito === unidadeRequisitante.ds){
          let rowData = {};
          rowData.id = values[row][0];
          rowData.dataPedido = values[row][1];
          rowData.nomeUnidade = values[row][2];
          rowData.equipe = unidadeRequisitante.equipe || "-";
          rowData.distrito = unidadeRequisitante.ds || '';
          rowData.grupoMaterial = unidadeRequisitante.grupoMaterial || '';
          rowData.qtdItensNoPedido = values[row][8];
          result.push(rowData);
        }
    }
    result.sort((a, b) => b.id - a.id);
    const res = paginarLista(paginaAtual, elementosPorPagina, result);
    return {
      findDistrito: distrito,
      totalElements: totalItens,
      totalElementsFound: result.length,
      pageNumber: paginaAtual,
      pageSize: elementosPorPagina,
      totalPages: res.totalDePaginas,
      data: res.listaDaPagina
    };
  }

  if (grupoMaterial !== "") {
    let range = sheet.getRange(2, 1, ultimoElemento -1, 9);
    // getRange(row, column, numRows, numColumns);
    let values = range.getValues();
    for (let row = 0; row < values.length; row++) {
      let unidadeRequisitante = JSON.parse(values[row][3]); 
      if(grupoMaterial === unidadeRequisitante.grupoMaterial){
        let rowData = {};
        rowData.id = values[row][0];
        rowData.dataPedido = values[row][1];
        rowData.nomeUnidade = values[row][2];
        rowData.equipe = unidadeRequisitante.equipe || "-";
        rowData.distrito = unidadeRequisitante.ds || '';
        rowData.grupoMaterial = unidadeRequisitante.grupoMaterial || '';
        rowData.qtdItensNoPedido = values[row][8];
        result.push(rowData);
      } 
    }
    result.sort((a, b) => b.id - a.id);
    const resultLimitado = listaComQuantidadeLimitada(result,60);
    return {
      findGrupoMaterial: grupoMaterial,   
      totalElements: totalItens,
      totalElementsFound: result.length,
      returnTotalElements: resultLimitado.length,
      data: resultLimitado      
    };
  }  
}

/** 
 * calcula paginação quando com a lista completa 
 * **/
function calcularPaginacaoListaCompleta(paginaAtual, elementosPorPagina, totalItens) {
  let totalPaginas, elemFim, elemInicio;
  totalPaginas = Math.ceil(totalItens / elementosPorPagina);
  if (paginaAtual < 1 || paginaAtual > totalPaginas) {    
    throw  error = {
      statusCode: 404,
      message: `Página fora do limite. Página: ${paginaAtual}`,
      status: "Not Found",
      details: ""
    };
  }
  elemFim = totalItens - (paginaAtual - 1) * elementosPorPagina;
  elemInicio = elemFim - elementosPorPagina + 1;
  elemInicio = Math.max(elemInicio, 1); // se for menor que 1 elemInicio recebe 1
  return {
    paginaAtual: paginaAtual,
    totalElementos: totalItens,
    totalPaginas: totalPaginas,
    elemInicio: elemInicio,
    elemFim: elemFim
  };
}

/** 
 * paginação da lista quando filtro distrito está aplicado
 * **/
function paginarLista(paginaAtual, elementosPorPagina, lista) {
  if (lista.length === 0) {     
    throw  error = {
      statusCode: 404,
      message: `Nenhum resultado encontrado`,
      status: "Not Found",
      details: ""      
    }
  }
  const totalDePaginas = Math.ceil(lista.length / elementosPorPagina);
  if (paginaAtual < 1 || paginaAtual > totalDePaginas) {    
    throw  error = {
      statusCode: 404,
      message: `Página fora do limite. Página: ${paginaAtual}`,
      status: "Not Found",
      details: ""
    };
  }
  const indiceInicial = (paginaAtual - 1) * elementosPorPagina;
  const indiceFinal = indiceInicial + elementosPorPagina;
  const listaDaPagina = lista.slice(indiceInicial, indiceFinal);
  return {listaDaPagina, totalDePaginas};
}

function listaComQuantidadeLimitada(result, limiteResultado) {
    if (result.length < limiteResultado)
        return result;    
    return result.slice(0, limiteResultado);
}

/** 
 * Retorna lista de pedidos que estiver entre os parâmetros inicio e fim.
 * inicio: id do pedido mais antigo (número do id menor).
 * fim: id do pedido mais recente (número do id maior)
 * linha inicial precisa ser menor que a linha final
*/
function retornarItensIntervalo(inicio, fim) {
  let lastRow = sheet.getLastRow();
  let elemInicio = Math.min(inicio, lastRow);
  let elemFim = Math.min(fim, lastRow);
  if (elemInicio > elemFim) {
     throw  error = {
      statusCode: 422,
      message: 
      `O parâmetro inicio (startId) não pode ser maior que o parâmetro fim (endId), inicio: ${elemInicio}, fim: ${elemFim}`,
      status: "Unprocessable Entity",
      details: ""
    };
  }
  if (elemInicio == 1) {
    elemInicio = lastRow - 9;
    elemFim = lastRow;
  }  
  let range = sheet.getRange(elemInicio, 1, elemFim - elemInicio + 1, 5);
  let values = range.getValues();
  let result = [];
  for (let row = 0; row < values.length; row++) {
    let rowData = {};
    rowData.id = values[row][0];
    rowData.dataPedido = values[row][1];
    rowData.nomeUnidade = values[row][2];
    rowData.equipe = JSON.parse(values[row][3]).equipe || "-";
    rowData.itens = values[row][4] || "-";
    result.push(rowData);
  }  
  return {
    totalElementos: lastRow,
    function: 'retornarItensIntervalo',
    data: result    
  };
}

/** 
 * Encontrar na Folha 
 * **/
function findBySheet(str) {
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
    let valorColunaE = guia.getRange("E" + linha).getValue();
    let valorColunaF = guia.getRange("F" + linha).getValue();
    let objeto = {
      id: valorColunaA,
      data: valorColunaB,
      unidade: valorColunaC,
      itens: valorColunaE,
      tipoPedido: valorColunaF
    };
    Logger.log('Resultado Pesquisa: '+ valorColunaA+' : '+valorColunaC);
    if (!listaDeObjetos.some(item => JSON.stringify(item) === JSON.stringify(objeto))) {
      listaDeObjetos.push(objeto);
    }
  }
  listaDeObjetos.sort((a, b) => b.id - a.id);
  return listaDeObjetos;  
}

function ultimaLinha() {
  return sheet.getLastRow();
}

// https://developers.google.com/apps-script/reference/spreadsheet/sheet?hl=pt-br