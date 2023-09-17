const content = document.getElementById("content").innerHTML = "<b>Requisição de Material</b>";

const datalist = document.getElementById("item-list");

const itemOptions = [
    "condicionador ácido",
    "óxido de zinco",
    "eugenol",
    "sugador",
    "sugador cirúrgico",
    "adesivo",
    "ionomero de vidro"
];

itemOptions.forEach(option => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    datalist.appendChild(optionElement);
});