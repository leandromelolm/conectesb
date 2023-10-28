
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

exports.handler = async function (event, context) {
  const script = process.env.APP_SCRIPT_GOOGLE_V33;
  const planilha = process.env.URL_PLANILHA_GOOGLE;

  return {
    statusCode: 200,
    body: JSON.stringify({ appscript: script, urlspreadsheet: planilha }),
  };  
};
