const sheetName = 'Sheet1';
const scriptProp = PropertiesService.getScriptProperties();
const urlSpreadSheet1 = 'https://docs.google.com/spreadsheets/d/1ZPSsgOIJJE0p-QT4r2pwVmf4zMtUE5x4FnwnTTig4W0/edit?pli=1#gid=0';
const urlSpreadSheet = 'https://docs.google.com/spreadsheets/d/1ZPSsgOIJJE0p-QT4r2pwVmf4zMtUE5x4FnwnTTig4W0/edit';
const sheets = SpreadsheetApp.openByUrl(urlSpreadSheet1);
const sheet = sheets.getSheetByName("Sheet1");

// const initialSetup = () => {
//   const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
//   scriptProp.setProperty('key', activeSpreadsheet.getId());
// }

function doPost(e) {
  const data = e.parameter;
  sheet.appendRow([data.dadosRequerente, data.dadosItens]);
  return ContentService.createTextOutput("sucess!");
}

function doGet(e) {
    let obj = {}
    let datas = sheet.getDataRange().getValues();
    obj.myalldata = datas;
    return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

//--------------------------------------------------------------------------------


/*

Crie um novo arquivo de script do google desvinculado de qualquer planilha.
No arquivo de script renomeie ele para o que você precisar
Apague tudo o que tiver dentro
Copie o código abaixo e cole

Clique em Implantar
em "executar como" selecione o seu email
em "quem pode acessar" selecione qualquer pessoa

clique em implantar, faça login com a sua conta e de as permissões

copie o link que aparece na parte de baixo começando com https://

*/

// colar este código no script do google script
// function doPost(e) {

//   ContentService.createTextOutput(JSON.stringify({ method: "POST", eventObject: e }))
//     .setMimeType(ContentService.MimeType.JSON);
//   const dados = JSON.parse(e.postData.contents);

//   try {

//     if (dados.requisicao == 'requisitar') {
//       return ContentService.createTextOutput(JSON.stringify(
//         SpreadsheetApp.openByUrl(dados.link).getSheetByName(dados.pagina).getRange(dados.celulas).getValues()
//       ));

//     } else if (dados.requisicao == 'enviar') {
//       SpreadsheetApp.openByUrl(dados.link).getSheetByName(dados.pagina).appendRow(dados.informacoes)// o metodo appendRow insere uma nova linha na pagina com todos os dados enviados
//       return ContentService.createTextOutput(JSON.stringify({ text: "sucesso" })).setMimeType(ContentService.MimeType.JSON);

//     } else {
//       return ContentService.createTextOutput(JSON.stringify({ text: "tipo de requisicao invalida" })).setMimeType(ContentService.MimeType.JSON);
    
//     }

//   } catch (erro) {
//     return ContentService.createTextOutput(JSON.stringify({ erro: erro.message })).setMimeType(ContentService.MimeType.JSON);

//   }

// }



//--------------------------------------------------------------------------------

/** 

// handle GET
const doGet = (e) => {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    // setting up the sheet
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName); 

    // getting the header (column name) from the GET request.
    const { header } = e.parameter;

    // getting the headers (column names) from the sheet.
    const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];

    // finding the correct column based on the header (column name).
    const column = headers.indexOf(header) + 1; // adding 1 because index is 0-based, and sheet is 1-based.

    // getting the values from the desired column.
    const dataRaw = sheet.getRange(2, column, sheet.getLastRow()-1, 1).getValues().map(item => item[0]);

    const data = Array.from(new Set(dataRaw));

    // returning
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', data }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', error }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

*/


//--------------------------------------------------------------------------------

// handle POST
// const doPost = (e) => {
//   const lock = LockService.getScriptLock();
//   lock.tryLock(10000);

//   try {
//     // setting up the sheet
//     const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
//     const sheet = doc.getSheetByName(sheetName); 

//     // getting the headers (column names) from the sheet.
//     const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];

//     // creating a new row of values from the POST body.
//     const newRow = headers.map((header) => {
//       return header === 'Date' ? new Date() : e.parameter[header];
//     });

//     // inserting the new row.
//     const nextRow = sheet.getLastRow() + 1;
//     sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

//     // returning
//     return ContentService
//       .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
//       .setMimeType(ContentService.MimeType.JSON);

//   } catch (error) {
//     return ContentService
//       .createTextOutput(JSON.stringify({ 'result': 'error', error }))
//       .setMimeType(ContentService.MimeType.JSON);

//   } finally {
//     lock.releaseLock();
//   }
// }



//--------------------------------------------------------------------------------

// handle GET
// const doGet = (e) => {
//   const lock = LockService.getScriptLock();
//   lock.tryLock(10000);

//   try {
//     // setting up the sheet
//     const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
//     const sheet = doc.getSheetByName(sheetName); 

//     // getting the header (column name) from the GET request.
//     const { header } = e.parameter;

//     // getting the headers (column names) from the sheet.
//     const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];

//     // finding the correct column based on the header (column name).
//     const column = headers.indexOf(header) + 1; // adding 1 because index is 0-based, and sheet is 1-based.

//     // getting the values from the desired column.
//     const dataRaw = sheet.getRange(2, column, sheet.getLastRow()-1, 1).getValues().map(item => item[0]);

//     const data = Array.from(new Set(dataRaw));

//     // returning
//     return ContentService
//       .createTextOutput(JSON.stringify({ 'result': 'success', data }))
//       .setMimeType(ContentService.MimeType.JSON);

//   } catch (error) {
//     return ContentService
//       .createTextOutput(JSON.stringify({ 'result': 'error', error }))
//       .setMimeType(ContentService.MimeType.JSON);

//   } finally {
//     lock.releaseLock();
//   }
// }



/*
code-google.gs

EXEMPLOS
https://github.com/levinunnink/html-form-to-google-sheet
https://github.com/omrkalman/html-X-google-sheet/blob/main/Code.gs.js

*/




