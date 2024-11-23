let bNovaAba = JSON.parse(sessionStorage.getItem("aberto-nova-aba"));
let idPedidoGlobal = "";

function abrirNovaAba(){
    const params = new URLSearchParams(window.location.search);
    let id = params.get('pedidofeito');
    id && getPedido(id) || bNovaAba && AplicarEstiloVisualizarPedido();        
};

async function getPedido(id) {
    limparCamposItens();
    sessionStorage.removeItem("dadosRequerente");
    sessionStorage.removeItem('dadosItens');
    disableInputs();
    hideButtons();
    spinnerLoading();
    document.querySelector('#docPrint').style.display = 'none';
    sessionStorage.removeItem("pedido");
    let pedido = await fetch(`/.netlify/functions/api-spreadsheet?id=${id}`)
    .then( data => {
        return data.json();
    })
    showButtonPrintAndClose();
    document.querySelector('#docPrint').style.display = 'block';
    localStorage.setItem('dadosItens', JSON.stringify(pedido.responseDataPedidos.itens));
    recuperarDadosItensLocalStorage();
    sessionStorage.setItem('dadosRequerente', JSON.stringify(pedido.responseDataPedidos.requisitante));
    recuperarDadosRequisitanteSessionStorage();
    visibilidadeDasLinhas(pedido.responseDataPedidos.qtdItens);
    changePageTitleAndTitleCenter(pedido.responseDataPedidos.id);
    removeSpinnerLoading();    
}

function spinnerLoading() {
    const centerContent = document.querySelector(".center-content");
    centerContent.insertAdjacentHTML("afterbegin", `
        <div id="spinnerGrow" class="spinner-grow" style="top:50%; left:50%; position:absolute"></div>`);    
}

function removeSpinnerLoading() {
    const centerContent = document.querySelector(".center-content");
    const spinner = centerContent.querySelector("#spinnerGrow");
    spinner && spinner.remove();
}

function AplicarEstiloVisualizarPedido() {
    disableInputs();    
    hideButtons(); 
    let pedido = JSON.parse(sessionStorage.getItem('pedido'));
    changePageTitleAndTitleCenter(pedido.id);
    idPedidoGlobal = pedido.id;
    showButtonPrintAndClose();
}

function changePageTitleAndTitleCenter(id) {
    document.querySelector('#pageTitle').innerHTML = `${id}`;
    document.getElementById("titleCenter").innerHTML = `PEDIDO ${id} - <b>NOTA DE REQUISIÇÃO E SAÍDA DE MATERIAL</b>`;
}

function showButtonPrintAndClose() {
    document.querySelector('#btnPrint').style.display = 'block';
    
    let centerContent = document.querySelector("#btnConfig");
    centerContent.insertAdjacentHTML("beforeend", `<button class="btn btn-outline-success my-2 btn__clear" onclick="abrirWhatsApp()">Compartilhar no Whatsapp</button>`);
    centerContent.insertAdjacentHTML("beforeend", `<div id="linkPedido"></div>`);
    centerContent.insertAdjacentHTML("beforeend", `<button id="btnCopy" class="btn btn-outline-dark btn__clear" onclick="copyText('linkPedido')">Copiar link</button>`);
    if (window.opener)
        centerContent.insertAdjacentHTML("beforeend", `<button class="btn btn-secondary my-4 btn__clear" onclick="fecharAba()">Fechar</button>`);
    else
        centerContent.insertAdjacentHTML("beforeend", `<a class="btn btn-link my-4" href="${window.location.origin}">Página Principal</a>`);
}

function hideButtons() {
    document.querySelector('#btnValidateToSend').style.display = 'none';
    document.querySelector('.tipo__pedido').style.display = 'none';
    document.querySelector('#btnPrint').style.display = 'none';
    document.querySelector('#toggleButton').style.display = 'none';
    document.querySelector('#cleanHeader').style.display = 'none';
    document.querySelector('#cleanItens').style.display = 'none';
    document.querySelector('header-component').style.display = 'none';
}

function disableInputs() {
    const inputs = document.querySelectorAll('input');
    let i = 0;
    let b = true;
    inputs.forEach((input, index) => {
        input.setAttribute('disabled', true);
        input.style.cssText = 'background-color:transparent; color: black';
        
        if(input.id === ''){
            if (b){
                i = i+1;
                input.style.cssText = 'background-color: #f7f7f7; color: black'
            }else{
                i = i+1;
                input.style.cssText = 'background-color:transparent; color: black'
            }                
            if(i>=2){                                         
                i = 0;
                if(b)
                    b = false
                else
                    b = true;
            }         
        }
    });

    document.querySelectorAll('select').forEach(select => {
        select.setAttribute('disabled', true)
        select.style.cssText = 'background-color:transparent; color: black';
    });
    document.querySelectorAll('.btn__quant').forEach( btnQuant => {
        btnQuant.style.cssText = 'display: none';
    })
}

function abrirWhatsApp() {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('pedidofeito');
    link = id ? `https://wa.me/?text=${window.location.href}` : `https://wa.me/?text=${window.location.href}?pedidofeito=${idPedidoGlobal}`;
    window.open(link, '_blank');
}

function fecharAba(){
    sessionStorage.setItem('aberto-nova-aba', false);
    window.close();
}

document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function() {
        if (document.querySelector('#linkPedido')) {
          const linkPedido = document.querySelector('#linkPedido');
          linkPedido.innerText = retornarLink();
          observer.disconnect();
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
});

function copyText(id){
    let r = document.createRange();
    document.getElementById(id).innerText = retornarLink();;
    r.selectNode(document.getElementById(id));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    try {
        document.execCommand('copy');
        window.getSelection().removeAllRanges();    
        document.getElementById('btnCopy').innerText = "Link copiado";
        setTimeout(() => {
            document.getElementById('btnCopy').innerText = "Copiar link";
        }, 3000);
    } catch (e) {
        console.log('Não foi possível copiar!');
        alert(`'Não foi possível copiar! ${e}`)
    }
}

function retornarLink() {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('pedidofeito');
    return link = id ? `${window.location.href}` : `${window.location.href}?pedidofeito=${idPedidoGlobal}`;
}