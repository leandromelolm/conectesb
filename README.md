# conectesb

Este projeto visa simplificar o processo de solicitação de insumos, materiais e instrumentais, substituindo o tradicional preenchimento manual feito em duas vias do documento de **NOTA DE REQUISIÇÃO E SAÍDA DE MATERIAIS**. Através de uma página web acessível tanto em computadores quanto em dispositivos móveis, os usuários podem enviar pedidos e imprimir uma **NOTA DE REQUISIÇÃO** de forma fácil e rápida. A página é compatível com os principais navegadores, apresenta campos com preenchimento interativo e intuitivo, além de oferecer a funcionalidade de impressão, resultando na geração de um documento em duas vias. Também foi implementada a funcionalidade para exibir os pedidos feitos e realizar a busca por pedido.

Outras funcionalidades foram implementadas. O projeto não foi finalizado.

Projeto hospedado no Netlify nos seguintes domínios: <br>
[conectesb.netlify.app](https://conectesb.netlify.app) <br>
[sbpedido.netlify.app](https://sbpedido.netlify.app)

### Executar o projeto 
```sh
## instalar dependências
npm install
## iniciar o projeto
npm start
```

### Comandos usados para usar o ambiente Node.js e hospedar no Netlify
As seguintes estratégias foram usadas para gerenciar as variáveis de ambiente.
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

## instalar axios
npm install axios

## instalar boostrap-icons
npm i bootstrap-icons

## instalar node-fetch
## https://stackoverflow.com/questions/48433783/referenceerror-fetch-is-not-defined
npm install node-fetch@2

## desinstalar pacotes npm
npm uninstall <package-name>

## Executar
npm run dev 
``` 

Criada pasta netlify.toml
```bash
[build]
    functions = "functions"
    publish = "src"
```

Criada Netlify Functions 
```bash
netlify function:create --name fetch-spreadsheet
type: Serverless function (Node/Go)
language: Javascript
template: javascript-hello-word
```

Executar projeto com netlify:

```sh
 netlify dev 
 ## ou  
 npm run start
 `````` 


```sh
## executar um ambiente de desenvolvimento local que imita o ambiente de produção do Netlify
netlify dev --context production
```

Alterado versão Node para 18.

```bash
# listar versões node
nvm ls
# alterar para usar versão
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
