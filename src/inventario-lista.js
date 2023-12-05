
window.addEventListener("DOMContentLoaded", () => {
    getApi();
})

function obterParametrosDaURL() {
    const url = new URL(window.location.href);
    const parametros = new URLSearchParams(url.search);
    const search = parametros.get('search');
    const protocolo = parametros.get('protocolo');
    return { search, protocolo };
}

function getApi(){
    const param = obterParametrosDaURL();
    let api = "https://script.google.com/macros/s/AKfycbzz7_n2zVB7XlDmIATenuP5j89uqTPypFnJmfRRi0Dql2-tnWf53IFHoDINUdO2PQ3uqw/exec"
    apiParam = `${api}?search=${param.search}`
    fetch(apiParam,{ 
        method: "GET",
    })
    .then(response =>response.json())
    .then(data => divListGroup(data))
    .catch(error => console.log(error));
}

function divListGroup(res){
    // console.log(res);
    let listGroupItem = document.getElementById('listGroupItem');
    let item = [];
    res.content.data.forEach(e => {
        item.push(`
        <a href="#" class="list-group-item list-group-item-action">
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${e.unidade}</h5>
                <small class="text-muted">${e.id}</small>
            </div>
            <p class="mb-1">${e.data}</p>
            <small class="text-muted">${e.funcionario}</small>
        </a>        
        `)        
    });
    listGroupItem.innerHTML = item.join('');
    document.getElementById('itemLoading').style.display = 'none';
    // localStorage.setItem('inventario-lista_enviados', JSON.stringify(res.content.data));
    // localStorage.setItem('inventario-lista_enviados_tamanho', res.content.data.length);
}
