let urlFetch = "https://script.google.com/macros/s/AKfycbw7l2v-1EZ8YNM3Ok6aH_AlaRtEql0OF-jOUGDKN_opyjEu39UOoBqyh_DKXFqfZLK7/exec";
let access_token;
window.addEventListener('DOMContentLoaded', () =>{
    access_token = localStorage.getItem("access_token");
    chamado_list = sessionStorage.getItem("chamado_list");
    let objChamado = JSON.parse(chamado_list);
    if (objChamado) {
        return handleResponseChamados(objChamado);
    }

    if (!access_token || access_token !="null") {
        fetchChamados(urlFetch, access_token);
        document.getElementById("msgAguarde").classList.toggle("d-none", false);
        document.getElementById("formLogin").classList.toggle("d-none", true);    
    } else {
        console.log("erro no acesso: problema na autenticação")
    }
})

function loginFetchAPI() {   
    let user = {
        loginPage: true,
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    }
    userString = JSON.stringify(user);

    document.getElementById("formLogin").classList.toggle("d-none", true);
    document.getElementById("msgAguarde").classList.toggle("d-none", false);

    fetch(urlFetch,{
        redirect: "follow",
        method: "POST",
        body: userString,
        headers: {
            "Content-Type": "text/plain;charset=utf-8",
        }
    })
    .then(response => response.json())
    .then(data => responseOK(data))
    .catch(error => responseError(error));
}

function responseOK(data) {
    localStorage.setItem("access_token", data.authorization);
    if (data.authorization == null) {
        document.getElementById("msgLogin").innerHTML = "Usuário e senha inválidos"
    }
    fetchChamados(urlFetch, data.authorization);
}

function responseError(error) {
    console.log("error", error);
}

async function fetchChamados(url,token) {
    const response = await fetch(`${url}?authorization=${token}`);
    const data = await response.json();
    sessionStorage.setItem("chamado_list", JSON.stringify(data));    
    handleResponseChamados(data);
}


function handleResponseChamados(data) {
    document.getElementById("msgAguarde").classList.toggle("d-none", true);      
    if (data.token === "token valido"){ 
        document.getElementById("formLogin").classList.toggle("d-none", true);
        document.getElementById("divChamados").classList.toggle("d-none", false);       
        preencherDivList(data.content);   
    } else {
        document.getElementById("formLogin").classList.toggle("d-none", false);
        document.getElementById("divChamados").classList.toggle("d-none", true);
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
    localStorage.removeItem("access_token");
    sessionStorage.removeItem("chamado_list")
    document.getElementById("formLogin").classList.toggle("d-none", false);
    document.getElementById("divChamados").classList.toggle("d-none", true);
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

// function sendFetchSpreadSheet() {    
//     fetch(urlFetch,{ 
//         method: "GET",
//     })
//     .then(response =>response.json())
//     .then(data => console.log(data))
//     .catch(error => console.log(error));
// };
