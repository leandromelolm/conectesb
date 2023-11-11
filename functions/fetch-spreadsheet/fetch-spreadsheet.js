// import axios from "axios";
const axios = require("axios");


exports.handler = async function (event, context, callback) {
  const script = process.env.APP_SCRIPT_GOOGLE;
  const urlplanilha = process.env.URL_PLANILHA_GOOGLE;
  const testEnv = process.env.TEST_ENV;


  if(event.httpMethod == "POST") {
    return callback(null,{
      statusCode: 200,
      body: JSON.stringify({
        appscript: script,
        urlspreadsheet: urlplanilha,
        eventBody: event.body,
        bodyObj: JSON.parse(event.body),
        testenv: testEnv,
        event_http_method: event.httpMethod,
        event_path: event.path,
        context: context,
        callback: callback
      })
    })
  }
  if(event.httpMethod == "GET") {
    
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
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

  }  
}
