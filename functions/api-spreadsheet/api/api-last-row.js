const axios = require("axios");

module.exports = async (event, context) => {

  let API_ENDPOINT = process.env.API_GOOGLE_SCRIPT_LASTROW;
  let response;

  try {
    response = await axios.get(API_ENDPOINT);
    console.log(response.data);
    
  } catch (error) {
    return {
          statusCode: err.statusCode || 500,
          body: JSON.stringify({
            error: error.message
          })
        }
  }
  return {
    statusCode: 200,
    body: response.data  
  }

  // try {
  //   response = await fetch(API_ENDPOINT)
  //   .then(res => res.json());
  //   console.log(response);
  // } catch (err) {
  //   return {
  //     statusCode: err.statusCode || 500,
  //     body: JSON.stringify({
  //       error: err.message
  //     })
  //   }
  // }    
  // return {
  //   statusCode: 200,
  //   body: response    
  // }
}