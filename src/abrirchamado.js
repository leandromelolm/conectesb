let listaChamados = [];

function adicionarItemAoChamado() {
    const equipamento = document.getElementById("equipamento").value;
    const numeroSerie = document.getElementById("numero_serie").value;
    const patrimonioTombamento = document.getElementById("patrimonio_tombamento").value;
    const problemaInformado = document.getElementById("problema_informado").value;

    if (!equipamento) {
        return alert (`Os campo EQUIPAMENTO precisam ser preenchidos.`);
    }
    if (!numeroSerie && !patrimonioTombamento) {
        return alert (`É necessario preencher o campo NÚMERO DE SÉRIE ou NÚMERO DE PATRIMÓNIO`);
    }
    if (!problemaInformado) {
        return alert (`Os campo PROBLEMA INFORMADO precisam ser preenchidos.`);
    }

    const novoChamado = {
        item: listaChamados.length + 1,
        equipamento: equipamento.trim(),
        numero_serie: numeroSerie.trim(),
        patrimonio_tombamento: patrimonioTombamento.trim(),
        problema_informado: problemaInformado.trim()
    };

    listaChamados.push(novoChamado);
    limparCampos();
    atualizarListaChamados();

    esconderDivAddItensAoChamado();
};

function mostrarDivAddItensAoChamado() {
    document.getElementById("divAddItensAoChamado").classList.toggle("hidden", false);
    document.getElementById("btnMostrarFormulario").classList.toggle("hidden", true);
};

function esconderDivAddItensAoChamado() {
    document.getElementById("divAddItensAoChamado").classList.toggle("hidden", true);
    document.getElementById("btnMostrarFormulario").classList.toggle("hidden", false);
};

function limparCampos() {
    document.getElementById("equipamento").value = "";
    document.getElementById("numero_serie").value = "";
    document.getElementById("patrimonio_tombamento").value = "";
    document.getElementById("problema_informado").value = "";
};

function atualizarListaChamados() {
    const listaChamadosElement = document.getElementById("listaChamados");
    listaChamadosElement.innerHTML = "";

    listaChamados.forEach(chamado => {
        const listItem = document.createElement("li");

        const btnRemover = document.createElement("button");
        btnRemover.textContent = "Remover";
        btnRemover.classList.add("btn__remove_item");
        listItem.appendChild(btnRemover);

        listItem.innerHTML += `<strong>${chamado.item}.</strong> Equipamento: <strong>${chamado.equipamento}</strong>, Número de Série: <strong>${chamado.numero_serie}</strong>, Patrimônio/Tombamento: <strong>${chamado.patrimonio_tombamento}</strong>, Problema: <strong>${chamado.problema_informado}</strong>`;
        listaChamadosElement.appendChild(listItem);
    });

    // ouvinte de evento de clique ao elemento pai (ul)
    listaChamadosElement.addEventListener("click", (event) => {
        const btnRemover = event.target.closest(".btn__remove_item");
        if (btnRemover) {
            const itemToRemove = btnRemover.parentElement.textContent.match(/\d+/)[0];
            removerItemChamado(itemToRemove);
        }
    });
};

function removerItemChamado(item) {
    const index = listaChamados.findIndex(chamado => chamado.item == item);
    if (index !== -1) {
        listaChamados.splice(index, 1);
        atualizarListaChamados();
    }
};

function validarCamposUnidadeSolicitante() {
    const unidade = document.getElementById("unidade").value;
    const solicitante = document.getElementById("solicitante").value;
    const btnEnviarChamado = document.getElementById("btnEnviarChamado");
    if (unidade.trim() == "" && solicitante.trim() == "") {
        // btnEnviarChamado.disabled = false;
        return "Preencha os campos UNIDADE E FUNCIONÁRIO SOLICITANTE.";
    }
    if(listaChamados.length == 0){
        return "Adicione ao menos um item para a abertura do chamado técnico.";
    }    
    if(unidade.trim() !== "" && solicitante.trim() !== "") {
        // btnEnviarChamado.disabled = true;
        return "OK";
    }
};

function enviarChamado() {
    let validacaoCampos = validarCamposUnidadeSolicitante();
    if(validacaoCampos != "OK"){
        return alert(validacaoCampos);
    }    

    const unidade = document.getElementById("unidade").value;
    const solicitante = document.getElementById("solicitante").value;
    const quantidadeListaChamado = listaChamados.length;
    const dataChamado = dateFormat(new Date());

    const chamadoAberto = {
        unidade: unidade.trim(),
        solicitante: solicitante.trim(),
        data: dataChamado,
        quantidadeListaChamado: quantidadeListaChamado,
        listaChamado: listaChamados
    };
    console.log(chamadoAberto);
    sendFetchPost(chamadoAberto)
}


function sendFetchPost(chamadoAberto){     
    mostrarMsgAguardeEnvio();

    let NewChamado = {
        _subject: `ABRIR CHAMADO TÉCNICO: ${chamadoAberto.unidade} - ${chamadoAberto.data}`,
        unidade: chamadoAberto.unidade,
        solicitante: chamadoAberto.solicitante,
        data: chamadoAberto.data,
        quantidade_de_itens_do_chamado: chamadoAberto.quantidadeListaChamado,
    }

    chamadoAberto.listaChamado.forEach((chamado, index) => {
        NewChamado[`item_do_chamado_${index + 1}`] = `ITEM: ${chamado.item}, EQUIPAMENTO: ${chamado.equipamento}, NUMERO DE SERIE: ${chamado.numero_serie}, PATRIMONIO/TOMBAMENTO: ${chamado.patrimonio_tombamento}, PROBLEMA INFORMADO: ${chamado.problema_informado}`;
    });

    let objPedidoString = JSON.stringify(NewChamado);

    fetch("https://formsubmit.co/ajax/us284sb2@gmail.com", {
        method: "POST",
        headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: objPedidoString
    })
    .then(response => response.json())
    .then(data => responseOK(data))
    .catch(error => responseError(error));
};

function formatarItemChamado(item) {
    return `item:${item.item},equipamento:${item.equipamento},numero_serie:${item.numero_serie},patrimonio_tombamento:${item.patrimonio_tombamento},problema_informado:${item.problema_informado}`;
};


function mostrarMsgAguardeEnvio(){
    const mensagemAguarde = document.getElementById("mensagemAguarde");
    mensagemAguarde.style.display = "block";
    document.getElementById("chamadoForm").classList.toggle("hidden", true);
};

function removerMsgAguardarEnvio(){
    document.getElementById("msgResponse").classList.toggle("hidden", false); 
    const mensagemAguarde = document.getElementById("mensagemAguarde");
    mensagemAguarde.style.display = "block";
    mensagemAguarde.style.display = "none";
    // const chamadoForm = document.getElementById("chamadoForm");
    // chamadoForm.setAttribute("disabled", true);
    // chamadoForm.removeAttribute("disabled");
};

function responseOK(data){
    removerMsgAguardarEnvio();
    console.log(data.success);  
    if(data.success == "true"){
        document.getElementById('msgResponse').innerHTML = `
        <p><b>A solicitação para abrir o chamado foi enviado com sucesso!</b></p>       
        Um email foi enviado para coordenação de saúde bucal.
        <p>
        <a href="index.html">Voltar</a>
        `;
        document.getElementById('msgResponse').style.background = '#4cb050';
        document.getElementById('msgResponse').style.color = 'white';
        console.log(data);
    } else {
        document.getElementById('msgResponse').innerHTML = `
        Erro no envio! Tente novamente mais tarde ou informe a messagem de erro para os administradores.
        messagem de erro: ${data.message}.
        <p>        
        <a href="index.html">Voltar</a>
        `;
        console.log(data);
    }
};

function responseError(error){
    alert(error)
    console.log(error);
};

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
