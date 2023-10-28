# requisicao-de-material


Projeto que gera uma página html de uma **NOTA DE REQUISIÇÃO E SAÍDA DE MATERIAIS** com campos para preenchimento 
e botão para imprimir que gera documento em duas vias.

Link online no github pages: [Nota de requisição e saíde de materiais](https://leandromelolm.github.io/requisicao-de-material/)


### Comandos para configurar ambiente Node.js no projeto e hospedar no Netlify com variáveis de ambiente
Projeto exportado para a pasta src, em seguida foi executado seguintes comandos:

`npm init`  
`npm install -D concurrently http-server`  
`npm run dev`  
`npm install -D netlify-cli -g`
`npm install dotenv`
`npm install axios`

Criar pasta netlify.toml
```
[build]
    functions = "functions"
    publish = "src"
```

Criar Netlify Functions 
```
netlify function:create --name fetch-spreadsheet
type: Serverless function (Node/Go)
language: Javascript
template: javascript-hello-word
```

Executar projeto com netlify:

 `netlify dev`  
 ou  
 `npm run start` 


Alterado versão Node para 18.

`nvm ls`  
`nvm use 18.16.0`  
