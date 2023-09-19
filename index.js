const nota = document.getElementById("nota").innerHTML = "<b>NOTA DE REQUISIÇÃO E SAÍDA DE MATERIAL</b>";

const datalist = document.getElementById("item-list");

const itemOptions = [
    "condicionador ácido gel ácido fosforico 37%",
    "óxido de zinco",
    "eugenol",
    "sugador",
    "sugador cirúrgico",
    "adesivo",
    "ionomero de vidro",
    "anestésico lidocaina 2% com vaso",
    "anestésico prilocaina 3% com vaso",
    "anestésico mepivacaina 3% com vaso",
    "anestesico mepivacaína sem vaso",
    "agulha gengival 30G curta",
    "fio de sutura nylon 4-0",
    "fio de sutura nylon 3-0",
    "fio de sutura seda",
    "resina A1",
    "resina A2",
    "resina A3",
    "resina A3,5",
    "resina B2",
    "Algodão rolos para uso odontológico",
    "tricresolformalina",
    "formocresol",
    "otosporim",
    "broca "
];

itemOptions.forEach(option => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    datalist.appendChild(optionElement);
});

function printBy(selector){
    var $print = $(selector)
        .clone()
        .addClass('print')
        .prependTo('body');

    // Stop JS execution
    window.print();

    // Remove div once printed
    $print.remove();
}

function toggleRowVisibility() {
    const rows = document.querySelectorAll('.tr_hidden');
    rows.forEach(row => {
        if (row.style.display === 'table-row') {
            row.style.display = 'none'; // Esconder a linha
        } else {
            row.style.display = 'table-row'; // Mostrar a linha
        }
    });
    const button = document.getElementById('toggleButton');
    if (button.value === 'Mostrar Mais Linhas') {
        button.value = 'Ocultar Linhas';
    } else {
        button.value = 'Mostrar Mais Linhas';
    }
}