
function capturarDadosDoFormulario() {
  let u = document.getElementById("username").value
  let p = document.getElementById("password").value
  let user = {
    loginPage: true,
    username: u.toLowerCase().trim(),
    password: p.trim()
  }
  userString = JSON.stringify(user);
  return userString;
}

function loginFetchAPI() {
  let user = capturarDadosDoFormulario();
  msgAguarde();
  let urlFetch = 'https://script.google.com/macros/s/AKfycbwFSFG79Sgu1P4HIO9kZ4huVb2FZOb38hvbsLhyJmrgPE7Pxx6GUERGCqphDcMRnnTqaA/exec'; // v24
  fetch(urlFetch,{
      redirect: "follow",
      method: "POST",
      body: user,
      headers: {
          "Content-Type": "text/plain;charset=utf-8",
      }
  })
  .then(response => response.json())
  .then(data => responseOK(data))
  .catch(error => responseError(error));
}

function responseOK(data) {
  // console.log(data);
  if (data.content.auth === false) {
    messageError(data.content.message);
  } else {
    localStorage.setItem("access_token", data.content.token);
    divSuccess();
  }
}

function responseError(error) {
  messageError(error);

}

function msgAguarde() {
  document.getElementById("msgAguarde").classList.toggle("d-none", false);
  document.getElementById('btnLogin').classList.toggle('d-none', true);
}

let segundos = 2;

function divSuccess() {
  document.getElementById("formLogin").classList.toggle("d-none", true);
  document.getElementById("msgAguarde").classList.toggle("d-none", true);
  document.getElementById("divSuccess").classList.toggle("d-none", false);
  setInterval(timerDecrement, 1000); 
  document.getElementById('messageSuccess').innerHTML = `
  <div class="alert alert-success">
      <div class="d-block" role="alert">
          <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:">
          </svg>
          <div>
              <h5 class="alert-heading text-center">Login realizado com sucesso!</h5>
          </div>
      </div>  
      <hr>
      <div class="d-grid gap-3 text-center">
        <div class="spinner-grow" style="place-self:center" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <div>
          <span>Aguarde... Você será redirecionado para Página Inicial.</span>         
        </div>
        <div id="contadorDecrementado">2</div>
          <a href="../index.html" class="alert-link text-decoration-none">Voltar para o menu principal</a>
      </div>                    
  </div>
  `
}

function timerDecrement() {
  segundos--;
  document.getElementById("contadorDecrementado").innerHTML = segundos;
  if (segundos < 1) { 
      window.location.replace("../index.html");
  }
}

function messageError(error = 'Verifique a conexão da internet, contate o administrador ou tente novamente mais tarde.') {
  document.getElementById("formLogin").classList.toggle("d-none", false);
  document.getElementById("msgAguarde").classList.toggle("d-none", true);
  document.getElementById('btnLogin').classList.toggle('d-none', false);
  
  document.getElementById('messageError').innerHTML =`
  <div style="width:270px">
    <span>Error ao fazer login. Verifique o usuário e a senha.</span>
    <p>${error}</p>
  </div>
  `
}
