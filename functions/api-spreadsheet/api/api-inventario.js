const axios = require("axios");

module.exports = async () => {

  let API_ENDPOINT = process.env.API_GS_INVENTARIO;
  let response;

  try {
    response = await axios.get(`${API_ENDPOINT}?search=all`);    
  } catch (error) {
    return {
          statusCode: err.statusCode || 500,
          body: JSON.stringify({
            error: error.message
          })
        }
  }
  return {
    body: JSON.stringify(response.data)
  }
}