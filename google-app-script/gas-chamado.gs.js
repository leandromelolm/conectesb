let spreadsheetUrl = "";
let spreadsheetId = "";
let sheetName = "";
let sheetCall = "";
const sheets = SpreadsheetApp.openByUrl(spreadsheetUrl);
const sheet = sheets.getSheetByName(sheetCall);
const key_jwt = "";

function doPost(e) {
  let dados = null;
  if (typeof e !== 'undefined') {
      dados = JSON.parse(e.postData.contents);     
  }

  if (dados.unidade && dados.solicitante && dados.data && dados.quantidadeListaChamado && dados.listaChamado) {
    if (dados.unidade.length > 50 || dados.solicitante.length > 50 || (dados.email && dados.email.length > 50)) {
      return ContentService.createTextOutput(
        JSON.stringify({
            status: "error", 
            message: "Tamanho das strings inválido!"
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    let spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    let sheet = spreadsheet.getSheets()[0];
    const id = sheet.getLastRow() + 1;
    let chamado = [id, dados.unidade, dados.solicitante, dados.email, dados.data, dados.quantidadeListaChamado];
    let listaChamado = dados.listaChamado;
    for (let i = 0; i < listaChamado.length; i++) {
      chamado.push(listaChamado[i]);
    }
    sheet.appendRow(chamado);
    // Logger.log(chamado);
    return ContentService.createTextOutput(
      JSON.stringify({
          status: "success", 
          message: "Pedido de chamado registrado com sucesso!",
          content: chamado
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } else {  
    return ContentService.createTextOutput(
      JSON.stringify({
          status: "error", 
          message: "Parâmetros inválidos!",
          content: dados
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  let token = null;
  let data = [];
  try {
    const { parameter } = e;
    const { authorization, name } = parameter;
    token = authorization
    const res = validateJwtToken(token);
    if (res.auth) {
      token = "token valido"
      data = itensPaginadosOrdemInversa(1, 20);      
    }
    if (!res.auth) {
      data = {"res": res, message: "usuário não está autorizado"}
    }
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        token: token,
        content:data
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        error: "Parâmetro de autorização inválido",
        token: token,
        content: error
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function verificarJwtToken(token) {
  return  verifyJwtTokenReturn(token,key_jwt);
}

function itensPaginadosOrdemInversa(paginaAtual, elementosPorPagina) {
  let lastRow = sheet.getLastRow();
  let totalPaginas = Math.ceil(lastRow / elementosPorPagina);
  if (paginaAtual < 1 || paginaAtual > totalPaginas || paginaAtual < 0) { 

    let error = {
      statusCode: 404,
      message: `Página fora do limite. Página: ${paginaAtual}`,
      status: "Not Found",
      details: ""
    };
    return error;   
  }
  let maxFim = lastRow - (paginaAtual - 1) * elementosPorPagina;
  let maxInicio = maxFim - elementosPorPagina + 1;
  maxInicio = Math.max(maxInicio, 1);
  let range = sheet.getRange(maxInicio, 1, maxFim - maxInicio + 1, 12);
  let values = range.getValues();
  let result = [];
  for (let row = 0; row < values.length; row++) {
    let rowData = {};
    if (values[row][0] != "ID"){
      rowData.id = values[row][0];
      rowData.unidade = values[row][1];
      rowData.funcionario = values[row][2];
      rowData.data = values[row][4];
      rowData.itens = values[row][5];
      for (let r = 1; r <= values[row][5]; r++){
        rowData[`item_${r}`] = values[row][5 + r];
      }      
      result.push(rowData);
    }
  }
  result.sort((a, b) => b.id - a.id);
  return {
    pageNumber: paginaAtual,
    totalPages: totalPaginas,
    pageSize: elementosPorPagina,
    totalRows: lastRow,
    data: result
  };
}