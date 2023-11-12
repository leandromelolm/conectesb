// import axios from "axios";
const axios = require("axios");


exports.handler = async function (event, context, callback) {
  const script = process.env.APP_SCRIPT_GOOGLE;
  const urlplanilha = process.env.URL_PLANILHA_GOOGLE;
  const testEnv = process.env.TEST_ENV;
  console.log(testEnv);


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
      }  
      const data = await response.text();
      console.log(data);
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
    } catch (error) {
      console.error('Erro durante a requisição:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
  }
  

  if(event.httpMethod == "GET") {

    /* GET /.netlify/functions/api-spreadsheet?id=&search=&page=&perPage=&startId=&endId=&search_key= */
    
    let id = event.queryStringParameters.id;
    let search = event.queryStringParameters.search;
    let page = event.queryStringParameters.page;
    let perPage = event.queryStringParameters.perPage;
    let startId = event.queryStringParameters.startId;
    let endId = event.queryStringParameters.endId;

    console.log(id);
   
    try {  
      let response = await axios.get(
        `${script}?id=${id}&search=${search}&page=${page}&perPage=${perPage}&startId=${startId}&endId=${endId}`
        );
      let res = response.data;
      return {
        statusCode: 200,
        body: JSON.stringify({ res }),
      };
    } catch (error) {
      
    }

  }  
}
