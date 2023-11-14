// TESTE GERAR PDF

function gerarTabelaPDF(pdf, dados, columns, startX, startY) {
    const margin = 10;
    const cellWidth = (pdf.internal.pageSize.getWidth() - margin * 2) / columns.length;
    const cellHeight = 15;
    pdf.setFillColor(204, 204, 204);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontStyle("bold");
    // Cabeçalho da tabela
    pdf.rect(startX, startY, pdf.internal.pageSize.getWidth() - margin * 2, cellHeight, "F");
    for (let i = 0; i < columns.length; i++) {
        pdf.text(startX + i * cellWidth, startY + cellHeight / 2, columns[i]);
    }
    pdf.setFontStyle("normal");
    // Dados da tabela
    for (let row = 0; row < dados.length; row++) {
        for (let col = 0; col < columns.length; col++) {
            pdf.text(startX + col * cellWidth, startY + (row + 1) * cellHeight, String(dados[row][col]));
        }
    }
    return startY + (dados.length + 1) * cellHeight;
}

function gerarPDF() {
    let pdf = new jsPDF();
    // Adiciona o cabeçalho do PDF
    pdf.setFont("Times", "bold", 16);
    pdf.text("Nota de Requisição e Saída de Material", 10, 10);
    // Adiciona os dados do formulário
    pdf.setFont("Times", "normal", 10);
    // Dados da requisição
    pdf.text("Unidade Requisitante: " + document.querySelector("#nomeUnidade").value, 10, 40);
    pdf.text("Distrito Sanitário: " + document.querySelector("#ds").value, 10, 50);
    pdf.text("Data: " + document.querySelector("#dataPedidoShowPrint").value, 10, 60);
    // Dados do material
    let especificacoesInputs = document.querySelectorAll(".td__especificacao input");
    let quantPedidaInputs = document.querySelectorAll(".td__quant_pedida input");
    // Cria um array para armazenar os dados da tabela
    let tableData = [];
    for (let i = 0; i < especificacoesInputs.length; i++) {
        let especificacao = especificacoesInputs[i].value;
        let quantidade = quantPedidaInputs[i].value;
        tableData.push([especificacao, quantidade]);
    }
    // Configuração da tabela
    let columns = ["Especificações", "Quantidade"];
    let startY = 70;  // Posição inicial da tabela
    startY = gerarTabelaPDF(pdf, tableData, columns, 10, startY);
    // Salva o arquivo PDF
    pdf.save("nota-requisicao.pdf");
}

$(document).ready(function () {
    $('#buttonPDF').click(function () {
        gerarPDF();
    });
});


// https://mrrio.github.io/jsPDF/examples/basic.html
function savePDF() {
    let data = new Date();
    let pdf = new jsPDF('p', 'pt', 'letter')
        , source = $('body')[0]
        , specialElementHandlers = {
            '#divLeft': function (element, renderer) {
                return true
            }
        }

    margins = {
        top: 80,
        bottom: 60,
        left: 40,
        width: 522
    };
    pdf.fromHTML(
        source // HTML string or DOM elem ref.
        , margins.left // x coord
        , margins.top // y coord
        , {
            'width': margins.width
            , 'elementHandlers': specialElementHandlers
        },
        function (dispose) {
            pdf.save("Relatorio - " + data.getDate() + "/" + data.getMonth() + "/" + data.getFullYear() + ".pdf");
        },
        margins
    )
}

$(document).ready(function () {
    $('#btnPDF').click(function () {
        savePDF();
    });
});