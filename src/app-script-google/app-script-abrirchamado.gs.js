let spreadsheetUrl = "URL_PLANILHA"
let spreadsheetId = "ID_PLANILHA"

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