# requisicao-de-material


Projeto que gera uma página html de uma **NOTA DE REQUISIÇÃO E SAÍDA DE MATERIAIS** com campos para preenchimento 
e botão para imprimir que gera documento em duas vias.

Projeto no Netlify: [Nota de requisição e saíde de materiais](https://sbpedido.netlify.app)

### Executar projeto 
```
npm install
```
```
npm start
```


### Comandos para configurar ambiente Node.js no projeto e hospedar no Netlify para usar variáveis de ambiente
Projeto exportado para a pasta src, em seguida foi executado seguintes comandos:

`npm init`  
`npm install -D concurrently http-server`  
`npm run dev`  
`npm install -D netlify-cli -g`
`npm install dotenv`

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

### Configuração Netlify

```
Runtime: Not set
Base directory: /
Package directory: Not set
Build command: Not set
Publish directory: src
Functions directory: functions
Deploy log visibility: Logs are public
```
