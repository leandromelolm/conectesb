function listaDePedidosComItens(idPedidoMaior, quantidadeDePedidos) {
  const result = pedidosComItens(idPedidoMaior, idPedidoMaior - Math.min(quantidadeDePedidos, 25))
  return ContentService.createTextOutput(
      JSON.stringify({
        search: 'listaDePedidosComItens',
        size: parseInt(quantidadeDePedidos, 10),
        idPedidoMaiorBuscado: +idPedidoMaior,
        content: result
      })).setMimeType(ContentService.MimeType.JSON);
}

/** 
 * Retornar pedidos com os itens. 
 * Parâmetro inicial deve ser menor que o parâmetro final.
 * parametro pedidoIdMenor: id inicial que deve ser buscadon (pedido mais antigo)
 * parametro pedidoIdMaior: id final que deve ser buscado (pedido mais recente)
 * retornar ordem decrescente dos pedidos.
 * 
*/
function pedidosComItens(pedidoIdMaior, pedidoIdMenor) {
  const  pedidoIdMenorAjustado = pedidoIdMenor+1; 
  let lastRow = sheet.getLastRow();
  
  const min = 2;
  const max = lastRow;

  let elemInicio = Math.min(Math.max(pedidoIdMenorAjustado, min),max);
  let elemFim = Math.min(pedidoIdMaior, lastRow);

  if (elemInicio > elemFim) {
     throw  error = {
      statusCode: 422,
      message: 
      `O parâmetro inicio (startId) não pode ser maior que o parâmetro fim (endId), inicio: ${elemInicio}, fim: ${elemFim}`,
      status: "Unprocessable Entity",
      details: ""
    };
  }

  let range = sheet.getRange(elemInicio, 1, elemFim - elemInicio + 1, 5);
  let values = range.getValues();
  let result = [];
  for (let row = 0; row < values.length; row++) {
    let rowData = {};
    rowData.id = values[row][0];
    rowData.dataPedido = values[row][1];
    rowData.nomeUnidade = values[row][2];
    rowData.equipe = JSON.parse(values[row][3]).equipe || "-";
    rowData.itens = JSON.parse(values[row][4]) || "-";
    result.push(rowData);
  }

  result.sort((a, b) => b.id - a.id);

  return {
    totalElementos: lastRow,
    totalRetornado: result.length,
    data: result    
  };
}