// import { LINK_GOOGLE_SCRIPT, LINK_SPREADSHEET } from './env.js';
import { getLink } from './env.js';

// const linkGoogleScript = LINK_GOOGLE_SCRIPT
// const linkSpreadSheet = LINK_SPREADSHEET;
let dataEnv;
let linkGoogleScript, linkSpreadSheet;
let obterCelulas;
let linkGoogleScript16 = "https://script.google.com/macros/s/AKfycbyTH5vqL7NNn0qYTr6gIu-OshjKhMZGDMewxK16ITQTshDuy1QebjhHRFgvQA9Dol6hGw/exec";

window.onload = () =>{
    usarLinks();
    // setTimeout(() => {
    //     enviarDadosParaPlanilha(), obterDadosDaPlanilha();
    // }, "2000");  


    setTimeout(() =>{
        getSheetData();
    }, '3000');
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
            requisicao: 'enviar',
            link: linkSpreadSheet,
            pagina: 'pedidos',            
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

function atribuirValor(lastRow){
    obterCelulas = `A${lastRow}:E${lastRow-20}`
    console.log(obterCelulas)
}

function getSheetData(){    
    fetch(linkGoogleScript16, {
        method: 'POST',
        body: JSON.stringify({
          link: linkSpreadSheet,
          pagina: 'sheet1',
          celulas: obterCelulas,
          requisicao: 'obter',
        }),
    
      })
        .then((dados) => dados.json()) // acesse json do retorno
        .then((dados) => verificarDados(dados)); // chame a função que irá validar, filtrar, e verificar seus dados
    
};

fetch(linkGoogleScript16, {
    method: 'POST',
    body: JSON.stringify({
      link: '',
      pagina: 'sheet1',
      celulas:'',
      requisicao: 'ultimopedido',
    }),

})
.then((dados) => dados.json()) // acesse json do retorno
.then((dados) => atribuirValor(dados));





/*

PASSOS PARA SEREM EXECUTADOS NO SCRIPT.GOOGLE.COM

1- Crie um novo arquivo de script do google desvinculado de qualquer planilha
(drive.google.com -> Novo -> mais -> Script do Google App).

2- No arquivo de script renomeie e copie a função doPost(e) do arquivo code-appscript_v16.gs

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

// colar código code-appscript_v16.gs no script do google script
