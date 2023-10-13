// import { LINK_GOOGLE_SCRIPT, LINK_SPREADSHEET } from './env.js';
import { getLink } from './env.js';

// const linkGoogleScript = LINK_GOOGLE_SCRIPT
// const linkSpreadSheet = LINK_SPREADSHEET;
let dataEnv;
let linkGoogleScript, linkSpreadSheet;

window.onload = () =>{
    usarLinks();

    setTimeout(() => {
        enviarDadosParaPlanilha(), obterDadosDaPlanilha();
    }, "2000");  
}

async function usarLinks() {
    dataEnv = await getLink();
    linkGoogleScript = dataEnv.link_google_script;
    linkSpreadSheet = dataEnv.link_spreadsheet;
}

function enviarDadosParaPlanilha() {
    fetch(linkGoogleScript, {
        method: 'POST',
        body: JSON.stringify({
            link: linkSpreadSheet,
            pagina: 'pedidos',
            requisicao: 'enviar',
            informacoes: 
            [
                new Date(), 
                "coluna 2", 
                "coluna 3", 
                "coluna teste 4"
            ]
        }),
    })
    .then((dados) => dados.json())
    .then((dados) => respostaDosDadosEnviados(dados));
};

function respostaDosDadosEnviados(dados){
    console.log(dados);    
}

function obterDadosDaPlanilha() {

    const requestData = {
        requisicao: 'requisitar',
        link: linkSpreadSheet,
        pagina: 'pedidos', 
        celulas: 'A2:B1000' // A5:E5, A2:E100, A2:B1000
    };

    fetch(linkGoogleScript, {
        method: 'POST',        
        body: JSON.stringify(requestData),
    })
    .then((dados) => dados.json()) 
    .then((dados) => verificarDados(dados));
};

function verificarDados(dados){
    console.log(dados);
}



/*

PASSOS PARA SEREM EXECUTADOS NO SCRIPT.GOOGLE.COM

1- Crie um novo arquivo de script do google desvinculado de qualquer planilha
(drive.google.com -> Novo -> mais -> Script do Google App).

2- No arquivo de script renomeie e copie a função doPost(e) abaixo.

3- Clique em Implantar
(IMPLANTAR -> NOVA IMPLANTAÇÃO -> ENGRENAGEM -> APP DA WEB -> CONFIGURAÇÃO)
em "executar como" selecione o seu email
em "quem pode acessar" selecione qualquer pessoa
 
4- clique no botão implantar no modal aberto, faça login com a sua conta e de as permissões.

5- copie o link que aparece na parte de baixo onde tem App da Web URL.
Depois atribuir o link a variável LINK_GOOGLE_SCRIPT.

REFERÊNCIA
https://support.google.com/docs/thread/188243991/utilizando-api-no-google-sheets?hl=pt

*/

// colar este código no script do google script
function doPost(e) {
    ContentService.createTextOutput(JSON.stringify({ method: "POST", eventObject: e }))
      .setMimeType(ContentService.MimeType.JSON);
    const dados = JSON.parse(e.postData.contents);
    const response = { method: "POST", eventObject: e };
 
    try {  
      if (dados.requisicao == 'requisitar') {
        return ContentService.createTextOutput(JSON.stringify(
          SpreadsheetApp.openByUrl(dados.link).getSheetByName(dados.pagina).getRange(dados.celulas).getValues()
        ));  
      } else if (dados.requisicao == 'enviar') {
        const sheet = SpreadsheetApp.openByUrl(dados.link).getSheetByName(dados.pagina);
        const lastRow = sheet.getLastRow() + 1;
        sheet.appendRow(dados.informacoes);
        response.text = "sucesso";
        response.insertedRow = lastRow;
        return ContentService.createTextOutput(
          JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);          
      } else {
        return ContentService.createTextOutput(
          JSON.stringify({ text: "tipo de requisicao invalida" })).setMimeType(ContentService.MimeType.JSON);      
      }  
    } catch (erro) {
      return ContentService.createTextOutput(
        JSON.stringify({ erro: erro.message })).setMimeType(ContentService.MimeType.JSON);  
    }  
}