
// const handler = async (event) => { 

//   try {
//     const subject = event.queryStringParameters.name || 'World'
//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: `Hello ${subject}` }),     
//     }
//   } catch (error) {
//     return { statusCode: 500, body: error.toString() }
//   }
// }

// export default { handler }

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
        testenv: testEnv,
        event_http_method: event.httpMethod,
        event_path: event.path,
        context: context,
        callback: callback
      })
    })
  }
  if(event.httpMethod == "GET") {
    return callback(null,{
      statusCode: 200,
      body: JSON.stringify({
        event: event,
        eventParamId: event.queryStringParameters.id,
        eventParamSearch: event.queryStringParameters.search,
        event_http_method: event.httpMethod,
        event_path: event.path,
        context: context,
        callback: callback
      })
    })
  }

};  

