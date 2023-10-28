const sheetName = 'Sheet1';
const scriptProp = PropertiesService.getScriptProperties();
const urlSpreadSheet = 'LINK_PLANILHA';
const sheets = SpreadsheetApp.openByUrl(urlSpreadSheet);
const sheet = sheets.getSheetByName(sheetName);

// const initialSetup = () => {
//   const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
//   scriptProp.setProperty('key', activeSpreadsheet.getId());
// }

// POST
const doPost = (e) => {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  // const dados = JSON.parse(e.postData.contents);

  try {
    
    // setting up the sheet
      const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
      const sheet = doc.getSheetByName(sheetName); 

      // getting the headers (column names) from the sheet.
      const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];

      // creating a new row of values from the POST body.
      const newRow = headers.map((header) => {
        return header === 'Date' ? new Date() : e.parameter[header];
      });

    if(e.parameter['requisicao'] == 'salvar'){
      // inserting the new row.
      const nextRow = sheet.getLastRow() + 1;
      sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);    

      // returning
      return ContentService
        .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
        .setMimeType(ContentService.MimeType.JSON);
    }else {
      return ContentService.createTextOutput(
        JSON.stringify({ 
          text: "tipo de requisicao invalida",
          "parameter": e.parameter[header]
        })).setMimeType(ContentService.MimeType.JSON);      
    }  

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', error }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}
