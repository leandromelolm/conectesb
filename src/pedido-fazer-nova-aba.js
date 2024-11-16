let bNovaAba = sessionStorage.getItem("aberto-nova-aba");

function funcaoNovaAba(){
    if (JSON.parse(bNovaAba)) {
        let pedido = JSON.parse(sessionStorage.getItem('pedido'));
        document.querySelector('#pageTitle').innerHTML = `${pedido.id}`;
        document.getElementById("titleCenter").innerHTML = `PEDIDO ${pedido.id} - <b>NOTA DE REQUISIÇÃO E SAÍDA DE MATERIAL</b>`;
        const inputs = document.querySelectorAll('input');
        let i = 0;
        let b = true;
        inputs.forEach((input, index) => {
            input.setAttribute('disabled', true);
            input.style.cssText = 'background-color:white; color: black';
            
            if(input.id === ''){
                if (b){
                    i = i+1;
                    input.style.cssText = 'background-color: #f7f7f7; color: black'
                }else{
                    i = i+1;
                    input.style.cssText = 'background-color:white; color: black'
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
            select.style.cssText = 'background-color:white; color: black';
        });
        document.querySelectorAll('.btn__quant').forEach( btnQuant => {
            btnQuant.style.cssText = 'display: none';
        })
        document.getElementById('btnSendSpreadsheet').style.display = "none";
        document.querySelector('.tipo__pedido').style.display = 'none';
        document.querySelector('#toggleButton').style.display = 'none';
        document.querySelector('#cleanHeader').style.display = 'none';
        document.querySelector('#cleanItens').style.display = 'none';
        document.querySelector('header-component').style.display = 'none';

        // let centerContent = document.querySelector(".center-content");
        // centerContent.insertAdjacentHTML("afterbegin", `<button class="btn" onclick="fecharAba()">Fechar</button>`);
        let centerContent = document.querySelector("#btnConfig");
        centerContent.insertAdjacentHTML("beforeend", `<button class="btn btn-danger my-4" onclick="fecharAba()">Fechar</button>`);

    } else {
        console.log(`${JSON.parse(bNovaAba)}`);
    }
};

function fecharAba(){
    sessionStorage.setItem('aberto-nova-aba', false);
    window.close();
}