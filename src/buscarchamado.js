let urlFetch = "https://script.google.com/macros/s/AKfycbxWGEAZpZv2I5zV4NPcNCk999dj-VD4eegbxyrvqrfGklo14EZpYWxU5q1sHtNNVDH6/exec";
let access_token;
let infoDivAtualizacaoPagina = document.getElementById('infoDivAtualizacaoPagina');

window.addEventListener('DOMContentLoaded', () =>{
    
    access_token = localStorage.getItem("access_token") || null;
    chamado_list = sessionStorage.getItem("chamado_list");
    let objChamado = JSON.parse(chamado_list);
    if (access_token == null) {
        window.location.href = "user/sign-in";
    }
    let validToken = checkTokenExpirationDate(access_token);
    if (!validToken.auth) {
        window.location.href = "user/sign-in";
    }
    document.getElementById("usuarioLogado").textContent = validToken.username;
    if (objChamado) {        
        infoFetchChamados(urlFetch, access_token);
        return handleResponseChamados(objChamado);
    } else {
        
        fetchChamados(urlFetch, access_token);
    }    
})


async function fetchChamados(url,token) {
    const response = await fetch(`${url}?authorization=${token}`);
    const data = await response.json();
    // console.log(`${url}?authorization=${token}`);
    sessionStorage.setItem("chamado_list", JSON.stringify(data));        
    handleResponseChamados(data);
    let loginDate = dateFormat(new Date());
    localStorage.setItem("dataHoraBuscaChamados", loginDate);
    infoFetchChamados(url,token);
}

function handleResponseChamados(data) {
    document.getElementById("btnLogout").disabled = false;
    document.getElementsByClassName("btn__Atualizarchamados").disabled = false;
    document.getElementById("msgAguarde").classList.toggle("d-none", true);      
    if (data.token === "token valido"){
        document.getElementById("divChamados").classList.toggle("d-none", false);       
        preencherDivList(data.content);   
    } else {
        document.getElementById("divChamados").classList.toggle("d-none", false);
    }
}

function preencherDivList(itens) {
    let itemAccordion = document.getElementById("itemAccordion");
    let itensCall = [];
    
    itens.data.forEach(e => {
        let chamado = [];
        for (let index = 1; index <= e.itens; index++) {
            let propertyName = `item_${index}`;
            let obj = e[propertyName];        
            if (obj) {
                let objParse = JSON.parse(obj);
                chamado.push(objParse);
            } else {
                console.log(`A propriedade ${propertyName} não existe.`);
            }
        }

        itensCall.push(`
        <div class="accordion-item">
            <h2 class="accordion-header" id="heading${e.id}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${e.id}" aria-expanded="false" aria-controls="collapse${e.id}">
                    <div class="row justify-content-md-center">
                        <div class="col-md-auto"> #${e.id} | ${e.unidade}</div>
                        <div class="col-md-auto"> ${dateFormat(e.data)}</div>
                        <div class="col-md-auto">                        
                            <span class="badge bg-primary rounded-pill">${e.itens}</span>
                        </div>
                    </div>
                </button>
            </h2>
            <div id="collapse${e.id}" class="accordion-collapse collapse" aria-labelledby="heading${e.id}" data-bs-parent="#accordionCall">
                <div class="accordion-body">                   
                    <div class="col">
                        ${chamado.map((item, index) => `
                            <div class="row accordion_body__item_chamado">
                                <strong>ABRIR CHAMADO - ITEM ${index + 1} </strong>                   
                            </div>                            
                            <div class="row accordion_body__row">
                                EQUIPAMENTO: ${item.equipamento}                    
                            </div>
                            <div class="row accordion_body__row">
                                SÉRIE: ${item.numero_serie}
                            </div>
                            <div class="row accordion_body__row">
                                PATRIMÔNIO(TOMBAMENTO): ${item.patrimonio_tombamento}
                            </div>
                            <div class="row accordion_body__row">
                                MARCA: ${item.marca}
                            </div>
                            <div class="row accordion_body__row">
                                MODELO: ${item.modelo}
                            </div>
                            <div class="row accordion_body__row">
                                PROBLEMA INFORMADO: ${item.problema_informado}                
                            </div>
                            <br>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>      
        `) 
    });

    itemAccordion.innerHTML = itensCall.join('');
}

function signOut() {
    infoDivAtualizacaoPagina.innerHTML = ``;
    localStorage.removeItem("access_token");
    localStorage.removeItem("dataHoraBuscaChamados");
    sessionStorage.removeItem("chamado_list")
    document.getElementById("divChamados").classList.toggle("d-none", true);
    window.location.href = 'index';
}

function infoFetchChamados(url,token){
    infoDivAtualizacaoPagina.innerHTML = "";    
    let dateTimeFetchCalls = localStorage.getItem("dataHoraBuscaChamados");
    infoDivAtualizacaoPagina.innerHTML = `
        Atualização dos dados: ${dateTimeFetchCalls} 
        <button id="btnAtualizarChamados" class="btn transparent btn__atualizarchamados" onclick="btnAtualizarChamado('${url}', '${token}')">
            Clique para atualizar <img src="assets/arrow-clockwise.svg"> 
        </button>
    `;    
}

function btnAtualizarChamado(url, token) {
    console.log("btnAtualizar");    
    document.getElementById("btnLogout").disabled = true;
    document.getElementById("btnAtualizarChamados").disabled = true;
    fetchChamados(url,token);
}

function dateFormat(data) {   
    const dataObj = new Date(data);
    if (dataObj.toString() == "Invalid Date"){
        return `Não foi possível verificar a data`;
    }    
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    const horas = String(dataObj.getHours()).padStart(2, '0');
    const minutos = String(dataObj.getMinutes()).padStart(2, '0');
    const segundos = String(dataObj.getSeconds()).padStart(2, '0');
    
    return `${dia}-${mes}-${ano} ${horas}:${minutos}:${segundos}`;
};

function checkTokenExpirationDate(token) {
    let s = token.split('.');
    var decodeString = atob(s[1]);
    // console.log(decodeString);
    const { exp, name } = JSON.parse(decodeString);
    // Verificar se não está expirado
    if (new Date(exp * 1000) > new Date()) {
        return res = {
            auth: true,
            message: 'Valid signature',
            expira: new Date(exp * 1000),
            username: name
        }
    } else {
        return res = {
            auth: false,
            message: 'The token has expired'
        }
    }
}
