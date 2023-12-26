function doPost(e) {
    let data = null;
    if (typeof e !== 'undefined') {
        data = JSON.parse(e.postData.contents);     
    }
    
    let to = data.emailPara;
    let carbonCopy = data.email || null;
    let name = `CHAMADO DSV: ${data.unidade}` || null;
    let subject = `Abrir chamado - Unidade: ${data.unidade}, Data ${data.data}` || null;
    let htmlBody = addObjUlHtml(data.quantidadeListaChamado, data.listaChamado, data.unidade, data.solicitante, data.data) || null;
    sendEmail(to, carbonCopy, name, subject, htmlBody);
  
    return ContentService.createTextOutput(
      JSON.stringify({
          statusCode: 200,
          sucess: "true",
          message: "Email enviado com sucesso",
          htmlBody: htmlBody
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  function sendEmail(to, carbonCopy, name, subject, htmlBody) {
    MailApp.sendEmail({
      to: to, 
      cc: carbonCopy,
      name: name,    
      subject: subject,
      htmlBody: htmlBody    
    });
    cotaEmail();
  }
  
  function addObjUlHtml(quantidadeListaChamado, listaChamado, unidade, solicitante, dataAtual) {
    let li = '';
    for (let i = 0; i < quantidadeListaChamado; i++) {
      let currentItem = JSON.parse(listaChamado[i]);
      li += `
        <li>
          <strong>Item:</strong> <span>${currentItem['item']}</span><br>
          <strong>Equipamento:</strong> <span>${currentItem['equipamento']}</span><br>
          <strong>Série:</strong> ${currentItem['numero_serie']}<br>
          <strong>Patrimônio:</strong> ${currentItem['patrimonio_tombamento']}<br>
          <strong>Marca:</strong> ${currentItem['marca']}<br>
          <strong>Modelo:</strong> ${currentItem['modelo']}<br>
          <strong>Problema Informado:</strong> ${currentItem['problema_informado']}<br>
        </li>
        <br>
        `;
    }  
    let bodyHtml = `
     <span>Solicitação de abertura de chamado técnico para DSV. Informações da unidade:</span><br>
      <strong>UNIDADE:</strong> <span>${unidade}</span><br>
      <strong>SOLICITANTE:</strong> <span>${solicitante}</span><br>
      <strong>DATA:</strong> <span>${dataAtual}</span><br>
      <ul>${li}</ul>
    `;  
    return bodyHtml;
  }
  
  function cotaEmail() {
    let emailQuotaRemaining = MailApp.getRemainingDailyQuota();
    Logger.log("Remaining email quota: " + emailQuotaRemaining);
  }