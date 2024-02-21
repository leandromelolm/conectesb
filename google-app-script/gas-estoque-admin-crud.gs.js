const ID_SPREADSHEET = getEnvIdSpreadSheet();

function doGet(e) {
  Logger.log(e);
  let op = e.parameter.action;
  let ss = SpreadsheetApp.open(DriveApp.getFileById(ID_SPREADSHEET));
  let sn = e.parameter.sheet || "PaginaTest";
  let sheet = ss.getSheetByName(sn);

  if (op == "insert")
    return insert_value(e, sheet);

  if (op == "read")
    return read_value(e, ss, sn);

  if (op == "update")
    return update_value(e, sheet);

  if (op == "delete")
    return delete_value(e, sheet);

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
    message: "insert success",
    currentTime: currentTime,
    id: id
  };
  let callback = request.parameters.callback;
  if (callback === undefined) {
    output.setContent(JSON.stringify(data));
  } else {
    output.setContent(callback + "(" + JSON.stringify(data) + ")").setMimeType(ContentService.MimeType.JSON);
  }
  return output;
}

function read_value(request, ss, sheetName) {
  var output = ContentService.createTextOutput(), data = {};
  data.records = readData_(ss, sheetName);

  var callback = request.parameters.callback;
  if (callback === undefined) {
    output.setContent(JSON.stringify(data));
  } else {
    output.setContent(callback + "(" + JSON.stringify(data) + ")").setMimeType(ContentService.MimeType.JSON);
  }
  return output;
}


function readData_(ss, sheetName, properties) {
  try {
    if (typeof properties == "undefined") {
      properties = getHeaderRow_(ss, sheetName);
      properties = properties.map(function (p) { return p.replace(/\s+/g, '_'); });
    }
    var rows = getDataRows_(ss, sheetName),
      data = [];
    for (var r = 0, l = rows.length; r < l; r++) {
      var row = rows[r],
        record = {};
      for (var p in properties) {
        record[properties[p]] = row[p];
      }
      data.push(record);
    }
    return data;

  } catch (error) {
    return error;
  }
}

function getDataRows_(ss, sheetName) {
  var sh = ss.getSheetByName(sheetName);
  try {
    return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  } catch (error) {
    // let output = ContentService.createTextOutput(), data = {};
    // data.content = {
    //   statusCode: 404,
    //   message: "O recurso solicitado não foi encontrado. " + error
    // };
    // return output.setContent(JSON.stringify(data));
    return error;
  }
}


function getHeaderRow_(ss, sheetName) {
  var sh = ss.getSheetByName(sheetName);
  try {
    return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
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
      result = "value updated successfully";
      flag = 1;
    }
  }
  if (flag == 0)
    result = "id not found";

  response = JSON.stringify({
    "message": result,
    currentTime: newCurrentTime,
    id: id
  });

  return ContentService
    .createTextOutput(request.parameter.callback + "(" + response + ")")
    .setMimeType(ContentService.MimeType.JSON);
}

function delete_value(request, sheet) {
  var id = request.parameter.id;
  var flag = 0;
  var lr = sheet.getLastRow();
  for (var i = 1; i <= lr; i++) {
    var rid = sheet.getRange(i, 2).getValue();
    if (rid == id) {
      sheet.deleteRow(i);
      var result = "value deleted successfully";
      flag = 1;
    }
  }
  if (flag == 0)
    var result = "id not found";

  result = JSON.stringify({
    "result": result,
    "id": id
  });

  return ContentService
    .createTextOutput(request.parameter.callback + "(" + result + ")")
    .setMimeType(ContentService.MimeType.JSON);
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