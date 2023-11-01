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

```sh
## Iniciar um pacote, criando o arquivo package.json
npm init

## Instalar dependencias
npm install -D concurrently http-server
npm install dotenv

## Instalar netlify globalmente
npm install -D netlify-cli -g

## instalar o Netlify CLI localmente, execute o seguinte comando no diretório raiz do projeto:
npm install netlify-cli --save-dev

## Executar
npm run dev 
``` 

Criar pasta netlify.toml
```bash
[build]
    functions = "functions"
    publish = "src"
```

Criar Netlify Functions 
```bash
netlify function:create --name fetch-spreadsheet
type: Serverless function (Node/Go)
language: Javascript
template: javascript-hello-word
```

Executar projeto com netlify:

 `netlify dev`  
 ou  
 `npm run start` 


```sh
## executar um ambiente de desenvolvimento local que imita o ambiente de produção do Netlify
netlify dev --context production
```

Alterado versão Node para 18.

```bash
#
nvm ls
#
nvm use 18.16.0
```  

### Configuração Netlify

```bash
Runtime: Not set
Base directory: /
Package directory: Not set
Build command: Not set
Publish directory: src
Functions directory: functions
Deploy log visibility: Logs are public
```
