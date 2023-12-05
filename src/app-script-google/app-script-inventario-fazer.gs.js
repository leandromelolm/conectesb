let spreadsheetUrl = '';
let spreadsheetId = '';
let sheetName = '';
let sheetName1 = '';
const sheets = SpreadsheetApp.openByUrl(spreadsheetUrl);
const sheet = sheets.getSheetByName(sheetName1);
const key_jwt = '';

// INVENTÁRIO

function doPost(e) {
  let dados = null;
  if (typeof e !== 'undefined') {
      dados = JSON.parse(e.postData.contents);     
  }

  if (dados.loginPage) {
    let accessToken = signinUser(dados);
    Logger.log(accessToken);
    return ContentService.createTextOutput(
      JSON.stringify({
          page: "login", 
          authorization: accessToken
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  if (
    dados.unidade && 
    dados.solicitante && 
    dados.data && 
    dados.quantidadeLista && 
    dados.listaInventario
    ) {
    if (
      dados.unidade.length > 70 || 
      dados.solicitante.length > 70 || 
      (dados.email && dados.email.length > 50)
      ) {
        return ContentService.createTextOutput(
          JSON.stringify({
              status: "error", 
              message: "Tamanho das strings inválido!"
          })
        ).setMimeType(ContentService.MimeType.JSON);
    }
    // let spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    // let sheet = spreadsheet.getSheets()[3]; // Aba Número 4
    // let sheet = spreadsheet.getSheetName("Inventario1");
    // const id = sheet.getLastRow() + 1;

    const valorUltimoId = obterUltimoValorColunaA();
    const id = valorUltimoId + 1;

    let codigo = `${converterDataParaProtocolo(dados.data)}${id}`;

    let chamado = [
      id, 
      codigo,
      dados.unidade, 
      dados.solicitante, 
      dados.email, 
      dados.data, 
      dados.quantidadeLista, 
      dados.observacao, 
      dados.listaInventario
    ];
    
    sheet.appendRow(chamado);
    return ContentService.createTextOutput(
      JSON.stringify({
          status: "success", 
          message: "Inventário registrado com sucesso!",
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

    const protocolo = e.parameter['protocolo'] || "";
    const search = e.parameter['search'] || "";


    if (search == "all"){
      let response = itensPaginadosOrdemInversa(1, 50);
      return ContentService.createTextOutput(
      JSON.stringify({
        content: response
      })
    ).setMimeType(ContentService.MimeType.JSON);
    }

    const { parameter } = e;
    const { authorization, name } = parameter;

    return ContentService.createTextOutput(
      JSON.stringify({
        content: e
      })
    ).setMimeType(ContentService.MimeType.JSON);

    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        error: "Parâmetro de autorização inválido",
        token: token,
        content: data
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}


function gerarToken(username) {
  return generateAccessToken(username);
}

function verificarJwtToken(token) {
  return  verifyJwtTokenReturn(token,key_jwt);
  // return parseJwt(token, key);
}

function signinUser(dados){  
  Logger.log("Tentativa de login");
  let userPesquisado = encontrarTextoNaColuna(dados.username);
  let token;
  let reqPassword = sha256(dados.password);
  if( userPesquisado[0].password === reqPassword && userPesquisado[0].username === dados.username ){
    Logger.log("senha iguais");
    token = gerarToken(userPesquisado[0].username);
  }else {
    Logger.log("usuario ou senha incorreto");
    token = null;
  }
  return token;
}

function encontrarTextoNaColuna(str) {
  let planilha = SpreadsheetApp.openById(spreadsheetId);
  let guia = planilha.getSheetByName(sheetName);  
  let colunaParaPesquisar = "C";  
  let textoParaEncontrar = str;
  let textFinder = guia.getRange(colunaParaPesquisar + ":" + colunaParaPesquisar)
      .createTextFinder(textoParaEncontrar);
  let resultados = textFinder.findAll();
  if (resultados.length == 0){   
    let arr = [];
    let obj = {
      id: "",
      user: "",
      username: "",
      password: ""
    }
    arr.push(obj);
    return arr;
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
    let valorColunaD = guia.getRange("D" + linha).getValue();
    let objeto = {
      id: valorColunaA,
      user: valorColunaB,
      username: valorColunaC,
      password: valorColunaD
    };   
    Logger.log('Resultado Pesquisa: '+ valorColunaA+' : '+valorColunaC +' : '+ valorColunaD);
    listaDeObjetos.push(objeto);    
  }
  return listaDeObjetos;
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
      // rowData.protocolo = values[row][1];
      rowData.unidade = values[row][2];
      rowData.funcionario = obterPrimeirosTresCaracteres(values[row][3]);
      let dataFormatada =formatarData(values[row][5])
      rowData.data = dataFormatada;         
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

function converterDataParaProtocolo(dataString) {
    const data = new Date(dataString);
    const ano = data.getFullYear();
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const dia = data.getDate().toString().padStart(2, '0');
    const horas = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');
    const segundos = data.getSeconds().toString().padStart(2, '0');
    const formatoDesejado = `${ano}${mes}${dia}${horas}${minutos}${segundos}00`;
    return formatoDesejado;
}

function formatarData(dataString) {
    const data = new Date(dataString);

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');

    return `${dia}-${mes}-${ano} ${horas}h${minutos}`;
}

function obterUltimoValorColunaA() {    
    const ultimaLinha = sheet.getLastRow();    
    const ultimaCelulaA = sheet.getRange('A' + ultimaLinha);
    const ultimoValorColunaA = ultimaCelulaA.getValue();
    Logger.log(ultimoValorColunaA)
    return ultimoValorColunaA;
}

function obterPrimeirosTresCaracteres(txt) {
    t = txt.substring(0, 3)
    return `${t}**`;
}