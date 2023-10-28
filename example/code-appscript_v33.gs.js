const sheetName = 'Sheet1';
const scriptProp = PropertiesService.getScriptProperties();
const urlSpreadSheet = 'LINK_PLANILHA';
const sheets = SpreadsheetApp.openByUrl(urlSpreadSheet);
const sheet = sheets.getSheetByName(sheetName);

// V33

// POST
const doPost = (e) => {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName);
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

    if (e.parameter['requisicao'] == 'salvar') {
      const nextRow = sheet.getLastRow() + 1;
      sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
      return ContentService
        .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      ContentService.createTextOutput(JSON.stringify(
        { method: "POST", eventObject: e }))
        .setMimeType(ContentService.MimeType.JSON);
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
      } else if (dados.requisicao == 'ultimopedido') {
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
