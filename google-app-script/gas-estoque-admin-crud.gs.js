const ID_SPREADSHEET = getEnvIdSpreadSheet();
const USER_SHEETNAME = getEnvSheetNameUser();

function doGet(e) {
  Logger.log(e);
  let op = e.parameter.action;
  let userid = e.parameter.id;
  let authUser = e.parameter.authuser;
  let ss = SpreadsheetApp.open(DriveApp.getFileById(ID_SPREADSHEET));
  let sn = e.parameter.sheet || "PaginaTest";
  let sheet = ss.getSheetByName(sn);

  if (op == "insert")
    return insert_value(e, sheet);

  if (op == "read")
    return read_value(e, sheet);

  if (op == "update")
    return update_value(e, sheet);

  if (op == "delete")
    return delete_value(e, sheet);

  if (op == "find")
    return find_value(e, sheet);

  if (authUser == "true")
    return user_auth(userid);
}

function insert_value(request, sheet) {
  const codigo = request.parameter.codigo;
  const item = request.parameter.item;
  const marca = request.parameter.marca;
  const validade = request.parameter.validade;
  const quantidade = request.parameter.quantidade;

  const id = gerarId(request.parameter.sheet);

  let d = new Date();
  let currentTime = d.toLocaleString();
  sheet.appendRow([currentTime, id, codigo, item, marca, validade, quantidade]);

  let output = ContentService.createTextOutput(), data = {};
  data.content =
  {
    statusCode: 200,
    message: "Inserido com sucesso",
    currentTime: currentTime,
    id: id
  };
  output.setContent(JSON.stringify(data));
  return output;
}

function read_value(request, sheet) {
  let output = ContentService.createTextOutput(), data = {};
  data.records = readData_(request, sheet);
  output.setContent(JSON.stringify(data));
  return output;
}


function readData_(request, sheet) {
  try {    
    properties = getHeaderRow_(sheet);
    properties = properties.map(
      function (p) { 
        return p.replace(/\s+/g, '_'); 
      });

    let rows = getDataRows_(sheet),
      data = [];
    for (let r = 0, l = rows.length; r < l; r++) {
      let row = rows[r],
        record = {};
      for (let p in properties) {
        record[properties[p]] = row[p];
      }
      data.push(record);
    }
    return data;

  } catch (error) {
    return error;
  }
}

function getDataRows_(sheet) {
  try {
    return sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  } catch (error) {
    return error;
  }
}

function getHeaderRow_(sheet) {
  try {
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  } catch (error) {
    return error;
  }
}

function update_value(request, sheet) {
  let id = request.parameter.id;
  let flag = 0;
  let codigo = request.parameter.codigo;
  let item = request.parameter.item;
  let marca = request.parameter.marca;
  let validade = request.parameter.validade;
  let quantidade = request.parameter.quantidade;
  let lr = sheet.getLastRow();
  let result;

  let d = new Date();
  let newCurrentTime = d.toLocaleString();

  for (let i = 1; i <= lr; i++) {
    let rid = sheet.getRange(i, 2).getValue();
    if (rid == id) {
      sheet.getRange(i, 1).setValue(newCurrentTime)
      sheet.getRange(i, 3).setValue(codigo);
      sheet.getRange(i, 4).setValue(item);
      sheet.getRange(i, 5).setValue(marca);
      sheet.getRange(i, 6).setValue(validade);
      sheet.getRange(i, 7).setValue(quantidade);
      result = "Atualizado com sucesso";
      flag = 1;
    }
  }
  if (flag == 0)
    result = "Id não encontrado";

  response = JSON.stringify({
    "message": result,
    currentTime: newCurrentTime,
    id: id
  });

  return ContentService
    .createTextOutput(response)
    .setMimeType(ContentService.MimeType.JSON);
}

function delete_value(request, sheet) {
  let id = request.parameter.id;
  let flag = 0;
  let lr = sheet.getLastRow();
  let result = "";
  for (let i = 1; i <= lr; i++) {
    let rid = sheet.getRange(i, 2).getValue();
    if (rid == id) {
      sheet.deleteRow(i);
      result = "Deletado com sucesso";
      flag = 1;
    }
  }
  if (flag == 0)
    result = "Id não encontrado";

  result = JSON.stringify({
    "result": result,
    "id": id
  });

  return ContentService
    .createTextOutput(result)
    .setMimeType(ContentService.MimeType.JSON);
}

function find_value(req, sheet) {
  let output = ContentService.createTextOutput(), data = {};
  data.records = readDataSearch_(sheet, req.parameter.column, req.parameter.value);
  output.setContent(JSON.stringify(data));
  return output;
}

function doPost(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "success", "data": "my-data" })).setMimeType(ContentService.MimeType.JSON);
}

function gerarId(sheetName) {
  return `${dateFormat()}${dateGetTimeMiliSeg()}${ultimoNumeroDaUltimaLinhaVazia(sheetName)}`;
}

function dateFormat() {
  let d = new Date();
  return d.toISOString().split("T")[0].replaceAll("-", "").slice(2);
}

function dateGetTimeMiliSeg() {
  let d = new Date();
  return d.getTime().toString().substring(5, 10);
}

function ultimoNumeroDaUltimaLinhaVazia(sn) {
  let ss = SpreadsheetApp.open(DriveApp.getFileById(ID_SPREADSHEET));
  let sheet = ss.getSheetByName(sn);
  let n = sheet.getLastRow() + 1;
  return n.toString().slice(-1);
}

/* Verificar autorização de usuario */
function user_auth(id) {
  let output = ContentService.createTextOutput(), data = {};
  const usser = encontrarValorNaColuna(id);
  data.content = {
    statusCode:usser.statusCode,
    message: usser.message,
    sheet: usser.sheetuser,
    success: usser.success,
    id: usser.id,
    role: usser.role
  };
  return output.setContent(JSON.stringify(data));
}

function encontrarValorNaColuna(userId) {
  let objeto = {}

  try{
    let planilha = SpreadsheetApp.openById(ID_SPREADSHEET);
    let guia = planilha.getSheetByName(USER_SHEETNAME);  
    let colunaParaPesquisar = "A";  
    let textoParaEncontrar = userId;
    let textFinder = guia.getRange(colunaParaPesquisar + ":" + colunaParaPesquisar).createTextFinder(textoParaEncontrar);
    let resultados = textFinder.findAll();

    if (resultados.length == 0){
      return objeto = {
        id: "",
        role: "",
        success: false,
        message:" Usuário não encontrado",
        statusCode: 404 
      }
    }

    for (let i = 0; i < resultados.length; i++) {
      let resultado = resultados[i];
      let linha = resultado.getRow();
      if (linha == 1) {
        continue; // Pule a linha de cabeçalho
      }
      if(guia.getRange("A" + linha).getValue() === textoParaEncontrar) {
        let valorColunaA = guia.getRange("A" + linha).getValue();
        let valorColunaE = guia.getRange("E" + linha).getValue();
        let valorColunaF = guia.getRange("F" + linha).getValue();

        objeto = {
          id: valorColunaA,
          role: valorColunaE,
          sheetuser: valorColunaF,
          success: true,
          message: "Usuário encontrado",
          statusCode: 200
        };
      }
    }
    return objeto;

  } catch (e) {
    return  objeto = {
        success: false,
        message: `Erro na pesquisa. ${e}`,
        statusCode: 500
      }
  }
}

function readDataSearch_(sheet, searchColumn, searchValue) {
  try {
    const headerRow = getHeaderRow_(sheet);
    const columnIndex = headerRow.indexOf(searchColumn);

    if (columnIndex === -1) {
      return {
        status: "error",
        code: 404,
        message: `Erro: Coluna '${searchColumn}' não encontrada na linha do cabeçalho.`,
      };
    }

    const dataRows = getDataRows_(sheet);
    const results = [];

    for (const row of dataRows) {
      if (row[columnIndex] === searchValue) {
        const result = {};
        for (let i = 0; i < row.length; i++) {
          result[headerRow[i]] = row[i];
        }
        results.push(result);
      }
    }

    if(results < 1) {
      return {
        status: "error",
        code: 404,
        message: `Nenhum resultado encontrado para a consulta.`,
        detailsMessage: `O item pesquisado não foi encontrado: ${searchValue}` ,
        content: results
      }
    }
    
    return results;
  } catch (error) {
    return error;
  }
}

