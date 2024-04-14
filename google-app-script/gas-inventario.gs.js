let spreadsheetUrl = '';
let spreadsheetId = '';
let sheetName = '';
let sheetName1 = '';
const sheets = SpreadsheetApp.openByUrl(spreadsheetUrl);
const sheet = sheets.getSheetByName(sheetName1);

/**
 * INVENTARIO
*/

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  let dados = null;
  if (typeof e !== 'undefined') {
      dados = JSON.parse(e.postData.contents);     
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
    } else {
      const valorUltimoId = obterUltimoValorColunaA();
      const id = valorUltimoId + 1;
      let protocolo = gerarProtocolo(dados.data, id);
      let inventario = [
        id, 
        protocolo, // inventario[1]
        dados.unidade, 
        dados.solicitante, 
        dados.email, 
        dados.data, // inventario[5]
        dados.quantidadeLista, 
        dados.observacao, 
        dados.listaInventario
      ];      
      sheet.appendRow(inventario);
      return ContentService.createTextOutput(
        JSON.stringify({
            status: "success", 
            message: "Inventário registrado com sucesso!",
            protocolo: inventario[1], 
            data: inventario[5]
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }    
  } else {  
    return ContentService.createTextOutput(
      JSON.stringify({
          status: "error", 
          message: "Parâmetros estão faltando ou incorretos!",
          content: dados
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  lock.releaseLock();
}

function doGet(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  let token = null;
  let data = [];
  try {
    const search = e.parameter['search'] || "";
    const id = e.parameter['id'] || "";
    const protocolo = e.parameter['protocolo'] || "";
    const authToken = e.parameter['authorization'] || "null";    

    if (search == "all"){
      let response = itensPaginadosOrdemInversa(1, 50);
      return ContentService.createTextOutput(
        JSON.stringify({
          content: response
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (protocolo != ''){
      let res = findByProtocolo(protocolo);
      return ContentService.createTextOutput(
        JSON.stringify({
          content:res
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (id != ""){
      // VALIDAR TOKEN
      let validacaoToken = validarToken(authToken);      
      if (!validacaoToken.auth){
        return ContentService.createTextOutput(
          JSON.stringify({
            token: validacaoToken,
          })
        ).setMimeType(ContentService.MimeType.JSON);    
      }
      let response = findById(id);
      return ContentService.createTextOutput(
        JSON.stringify({
          content: response,
          token: validacaoToken,
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const { parameter } = e;
    const { authorization, name } = parameter;

    let lastRow = sheet.getLastRow();

    return ContentService.createTextOutput(
      JSON.stringify({
        content: lastRow
      })
    ).setMimeType(ContentService.MimeType.JSON);
  
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        error: "Erro na requisição Get. Parâmetros estão faltando ou incorretos!",
        token: token,
        content: data
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }  
  lock.releaseLock();
}

function validarToken(token) {
  return  validateJwtToken(token);
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

function gerarParteInicialDoProtocolo(dataString) {
    const partesDataHora = dataString.split(' ');
    const partesData = partesDataHora[0].split('-');
    const ano = partesData[2].slice(2);
    const mes = partesData[1].padStart(2, '0');
    const dia = partesData[0].padStart(2, '0');
    const protocoloInicio = `${ano}${mes}${dia}`;
    return protocoloInicio;
}

function gerarParteFinalDoProtocolo(n) {
    const numeroString = n.toString();
    const zerosFaltando = 4 - numeroString.length;
    if (zerosFaltando > 0) {
        return '0'.repeat(zerosFaltando) + numeroString;
    } else {
        return numeroString;
    }
}

function gerarNumerosAleatorios(min, max) {
  const numeros = [];
  for (let i = 0; i < 4; i++) {
    numeros.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return numeros;
}

function gerarProtocolo(data, id) {
  let i = gerarParteInicialDoProtocolo(data);
  let m = gerarStringAleatoriaDeNumeros();
  let f = gerarParteFinalDoProtocolo(id);
  return `${i}${m}${f}`;
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

function findById(id) {
  let sheetData = sheet.getRange('A:A').getValues();  
  for (let i = 1; i < sheetData.length; i++) {
    let rowData = sheetData[i][0]; // A célula na coluna A
    if (rowData == id) {
      let linha = i + 1; // Adiciona 1 porque i começa em 0 e as linhas na planilha começam em 1
      return obterDadosDaLinha(linha);
    }
  }
  return null;
}

function findByProtocolo(protocolo) {
  let sheetData = sheet.getRange('B:B').getValues();
  
  for (let i = 1; i < sheetData.length; i++) {
    let rowData = sheetData[i][0];
    if (rowData == protocolo) {
      let linha = i + 1;
      return obterDadosDaLinha(linha);
    }
  }
  return null;
}

function obterDadosDaLinha(linha) {
  let valores = sheet.getRange(linha, 1, 1, 9).getValues()[0];
  
  return {
    id: valores[0],
    protocolo: valores[1],
    unidade: valores[2],
    responsavel: valores[3],
    data: valores[5],
    informacoesAdicionais: valores[7],
    itensInventario: valores[8]
  };
}

function getLastRow() {
  return sheet.getLastRow();
}

function gerarStringAleatoriaDeNumeros() {
  const numeros = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const numerosAleatorios = [];
  for (let i = 0; i < 4; i++) {
    numerosAleatorios.push(numeros[Math.floor(Math.random() * numeros.length)]);
  }
  return numerosAleatorios.join('');
}
