# requisicao-de-material

Este projeto visa simplificar o processo de solicitação de insumos, materiais e instrumentais, substituindo o tradicional preenchimento manual feito em duas vias do documento de **NOTA DE REQUISIÇÃO E SAÍDA DE MATERIAIS**. Através de uma página web acessível tanto em computadores quanto em dispositivos móveis, os usuários podem enviar pedidos e imprimir uma **NOTA DE REQUISIÇÃO** de forma fácil e rápida. A página é compatível com os principais navegadores, apresenta campos com preenchimento interativo e intuitivo, além de oferecer a funcionalidade de impressão, resultando na geração de um documento em duas vias. Também foi implementada a funcionalidade para exibir os pedidos feitos e realizar a busca por pedido.

Projeto hospedado no Netlify: [sbpedido.netlify.app](https://sbpedido.netlify.app)

### Executar projeto 
```sh
## instalar dependências
npm install
## iniciar o projeto
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

## instalar axios
npm install axios

## instalar boostrap-icons
npm i bootstrap-icons

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
