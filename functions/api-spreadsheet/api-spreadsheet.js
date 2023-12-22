// import axios from "axios";
const axios = require("axios");
const apiLastRow = require('./api/api-last-row.js');
const inventario = require('./api/api-inventario.js');
const fetch = require('node-fetch');

exports.handler = async function (event, context, callback) {
  const script = process.env.APP_SCRIPT_GOOGLE;
  const testEnv = process.env.TEST_ENV;

  if (event.httpMethod === "POST") {
    try {
      let param = JSON.parse(event.body);
      let params = new URLSearchParams(param);
      let sheetName = testEnv === "dev" ? "Sheet1-test" : "Sheet1";
      params.append("sheetName", sheetName);
  
      const response = await fetch(script, {
        method: "POST",
        body: params
      });  
      if (!response.ok) {
        throw new Error('Erro na requisição: ' + response.status);
      } else {
        const data = await response.text();
        let obj = JSON.parse(data);
        const responseBody = JSON.stringify({ 
          message: 'Requisição bem-sucedida', 
          numeroPedido: obj.row,
          dataPedido: param.date
        });
        const responseObject = {
          statusCode: 200,
          body: responseBody
        };  
        return responseObject;
      }
    } catch (error) {
      console.error('Erro durante a requisição:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message, success: false })
      };
    }
  }

  const path = event.path.replace(/\.netlify\/functions\/[^/]+/, '')
  const segments = path.split('/').filter(e => e)

  /* GET {domain}/.netlify/functions/api-spreadsheet/inventario */ 
  if (segments[0] === 'inventario') {
    /* GET {domain}/.netlify/functions/api-spreadsheet/inventario/all */
    if (segments[1] === "all") {
      let response1 = await inventario();
      // console.log("RESPONSE1", response1.body);
      let responseData = JSON.parse(response1.body);
      
      // REQUISIÇÃO DIRETA
      // let response = await axios.get(`${process.env.API_GS_INVENTARIO}?search=all`);
      // console.log(JSON.stringify(response.data));
      // let responseData = response.data;

      return {
        statusCode: 200,
        body: JSON.stringify(responseData),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json;charset=UTF-8'
        }
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ segments }),
    };
  }  
  
  if(event.httpMethod == "GET") {

    let id = event.queryStringParameters.id;
    let search = event.queryStringParameters.search;
    let page = event.queryStringParameters.page;
    let perPage = event.queryStringParameters.perPage;
    let startId = event.queryStringParameters.startId;
    let endId = event.queryStringParameters.endId;
    let lastRow = event.queryStringParameters.lastRow;
    
    /* GET {domain}/.netlify/functions/api-spreadsheet?lastRow=true */
    if (lastRow) {
      let res = await apiLastRow(lastRow, context);    
      return {
        statusCode: 200,
        body: JSON.stringify({ res }),
      };
    }
   
    /* GET {domain}/.netlify/functions/api-spreadsheet?id=&search=&page=&perPage=&startId=&endId=&search_key= */
    try {  
      let response = await axios.get(
        `${script}?id=${id}&search=${search}&page=${page}&perPage=${perPage}&startId=${startId}&endId=${endId}`
        );
      let responseDataPedidos = response.data;
      return {
        statusCode: 200,
        body: JSON.stringify({ responseDataPedidos }),
      };
    } catch (error) {
      
    }

  }  
}
