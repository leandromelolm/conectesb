const sheetName = 'Sheet1';
const scriptProp = PropertiesService.getScriptProperties();
const urlSpreadSheet = 'LINK_PLANILHA';
const sheets = SpreadsheetApp.openByUrl(urlSpreadSheet);
const sheet = sheets.getSheetByName(sheetName);

// POST
const doPost = (e) => {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  ContentService.createTextOutput(JSON.stringify(
  { method: "POST", eventObject: e }))
  .setMimeType(ContentService.MimeType.JSON);  
  const dados = JSON.parse(e.postData.contents);

  try {    
      // setting up the sheet
      const doc = SpreadsheetApp.openById(
        scriptProp.getProperty('key'));
      const sheet = doc.getSheetByName(sheetName); 
      // getting the headers (column names) from the sheet.
      const headers = sheet.getRange(
        1,1,1,sheet.getLastColumn()).getValues()[0];
      // creating a new row of values from the POST body.
      const newRow = headers.map((header) => {
        return header === 'Date' ? new Date() : e.parameter[header];
      });
    if(e.parameter['requisicao'] == 'salvar'){
      // inserting the new row.
      const nextRow = sheet.getLastRow() + 1;
      sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);       
      return ContentService
        .createTextOutput(JSON.stringify(
          { 'result': 'success',
           'row': nextRow,
           "parameter": e.parameter[header] 
          }
        )).setMimeType(ContentService.MimeType.JSON);
    } else if(dados.requisicao == 'obter'){
      return ContentService.createTextOutput(
        JSON.stringify(
        SpreadsheetApp.openByUrl(dados.link)
        .getSheetByName(dados.pagina)
        .getRange(dados.celulas)
        .getValues()
        )
      );
    } else if(dados.requisicao == 'ultimopedido'){
      return ContentService.createTextOutput(
        JSON.stringify(
          sheet.getLastRow()
        )
      );
    }
    else {
      return ContentService.createTextOutput(
        JSON.stringify(
          { 
            text: "tipo de requisicao invalida",
            "requisicao": dados.requisicao
          }
        )).setMimeType(ContentService.MimeType.JSON);      
    }  

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify(
        { 
          'result': 'error', error 
        }
      )).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// https://github.com/omrkalman/html-X-google-sheet
// https://developers.google.com/apps-script/reference/spreadsheet/sheet?hl=pt-br