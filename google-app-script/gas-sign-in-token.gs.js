/**
 * 
 * Autenticação de usuário
 * 
 **/

const spreadsheetId = ENV_SPREADSHEET_ID;
const sheetName = ENV_SHEETNAME;

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);
    let data = null;
    try {        
      if (typeof e !== 'undefined') {
          data = JSON.parse(e.postData.contents);     
      }
      if (data.loginPage) {
      let accessToken = signinUser(data);
      return ContentService.createTextOutput(
        JSON.stringify({
            page: "login", 
            content: accessToken
        })
      ).setMimeType(ContentService.MimeType.JSON);
      }
     
    } catch (erro) {
      return ContentService.createTextOutput(
        JSON.stringify({
          erroMessage: erro.message,
          obj: e,
          postDataContent: e.postData.contents,
          data: data
        })).setMimeType(ContentService.MimeType.JSON);  
    }  
  }

  function doGet(e) {
    return test_read(e);
  }

  function test_read(e){
    return ContentService.createTextOutput(
      JSON.stringify({ content: e})
    ).setMimeType(ContentService.MimeType.JSON)
  }

  function signinUser(data){
  let userPesquisado = encontrarTextoNaColuna(data.username);
  let token;
  let reqPassword = sha256(data.password);
  try{
    if( userPesquisado[0].password === reqPassword && userPesquisado[0].username === data.username ){
      token = gerarToken(userPesquisado[0].id,userPesquisado[0].username);
      let refreshToken = generateRefreshToken(userPesquisado[0].id, Utilities.getUuid());
      return obj = {
        auth: true,
        token: token,
        refresh_token: refreshToken,
        message: 'sucesso'
      }
    }else {
      return obj = {
        auth: false,
        token: null,
        message: 'usuario e senha incorreto'
      }
    }  

  } catch(e){
    console.log(e)
    return e;
  }
}

function encontrarTextoNaColuna(str) {
  let planilha = SpreadsheetApp.openById(spreadsheetId);
  let guia = planilha.getSheetByName(sheetName);  
  let colunaParaPesquisar = "C";  
  let textoParaEncontrar = str;
  let textFinder = guia.getRange(colunaParaPesquisar + ":" + colunaParaPesquisar)
      .createTextFinder(textoParaEncontrar);
  let resultados = textFinder.findAll();
  if (resultados.length == 0){   
    let arr = [];
    let obj = {
      id: "",
      user: "",
      username: "",
      password: ""
    }
    arr.push(obj);
    return arr;
  }
  let listaDeObjetos = [];
  for (let i = 0; i < resultados.length; i++) {
    let resultado = resultados[i];
    let linha = resultado.getRow();
    if (linha == 1) {
      continue; // Pule a linha de cabeçalho
    }
    let valorColunaA = guia.getRange("A" + linha).getValue();
    let valorColunaB = guia.getRange("B" + linha).getValue();
    let valorColunaC = guia.getRange("C" + linha).getValue();
    let valorColunaD = guia.getRange("D" + linha).getValue();
    let objeto = {
      id: valorColunaA,
      user: valorColunaB,
      username: valorColunaC,
      password: valorColunaD
    };   
    Logger.log('Resultado Pesquisa: '+ valorColunaA+' : '+valorColunaC +' : '+ valorColunaD);
    listaDeObjetos.push(objeto);    
  }
  return listaDeObjetos;
}

function gerarToken(id, username) {
  return generateAccessToken(id, username);
}

function validarToken(token) {
  return  validateJwtToken(token);
}