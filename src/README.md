
## IMPLEMENTAÇÃO CONCLUÍDA:

- [x] Alterar background do input para torná-lo mais visível durante o preenchimento
- [x] Salvar no localStorage os inputs da unidade requerente e itens pedidos
- [x] Diminuir o tamanho da fonte dos itens na coluna de especificação para se adequar à impressão
- [x] Adicionar requisição fetch POST em uma planilha do Google
- [x] Adicionar requisição GET de uma linha específica da planilha
- [x] Alterar a exibição do botão imprimir no evento de clique
- [x] Adicionar botão "ENVIAR PEDIDO" que envia o pedido para a planilha e retorna mensagem de sucesso
- [x] Adicionar requisição GET de uma determinada coluna da planilha

## EM DESENVOLVIMENTO:

- [-] Implementar página `Abrir Chamado para Manuteção` para receber solicitações de chamados de manutenção
- [-] criar planilha para receber os chamados

## PRÓXIMAS ETAPAS:

- [ ] Corrigir: mostrar mensagem de erro quando a página não estiver conectada a internet
- [ ] Criar página `fazerpedido` e transferir conteúdo da página `index`
- [ ] Implementar enviar email para coordenação quando chegar um pedido
- [ ] Modificar estrutura do projeto para framework Angular
- [ ] Adicionar: paginação na pagina pedidos
- [ ] Adicionar: notificação Toast Bootstrap para mensagem de envio de pedido com sucesso
- [ ] Mover a lista de itens para um arquivo externo ao `index.js`
- [ ] Implementar salvar em PDF que ao clicar no botão abre nova aba em pdf com o arquivo
- [ ] Adicionar mensagem de desenvolvedor no rodapé da página

<br>

## ATALHOS PARA MELHOR PRODUTIVIDADE

#### VSCode

`ctrl+PageUp` - Alternar abas (editor e terminal)</br>
`ctrl+J ou ctrl+Shift+´ ` - Abrir terminal</br>
`Ctrl+B` - Painel Lateral esquerdo</br>
`Ctrl+Shift+E` - Aba explorador</br>
`Ctrl+Shift+P` - Pesquisar - tudo</br>
`Ctrl+P ou Ctrl+E` - Pesquisar arquivo</br>
`Ctrl+Shift+F` - Abre a barra de pesquisa menu lateral
`Ctrl+Shift+H` - Aba Pesquisar</br>
`Ctrl+H` - Substituir</br>
`Ctrl+F` - Pesquisar no Arquivo</br>
`Ctrl+G` - Pesquisar em Linha</br>
`Ctrl+Shift+V` - Abrir visualizador para .md</br>
`Alt+setaCimaOusetaBaixo` mover linha selecionada<br>
`Alt+setaCimaOusetaBaixo` mover linha selecionada<br>
`Ctrl+]` Tab + linha<br>
`Ctrl+[` Tab - linha<br>
`Ctrl+Shift+]` Colapsar apenas o bloco atual<br>
`Ctrl+Shift+[` Expandir apenas o bloco atual<br>
`Ctrl+Shift+O` Navegar entre funções, classes ou símbolos<br>
`Ctrl+Shift+K` Excluir linha<br>
`Ctrl+M` Guia Move o Foco<br>
`Ctrl+L` Selecionar linha<br>
`Ctrl+D` Selecionar todas as ocorrências<br>
`Ctrl+Shift+.` Navegar no editor rapidamente entre as funções do arquivo de código<br>
`F12` Ir para referência do valor que está selecionado no curso<br>
`ALT+J` Exibir: Ativar/Desativar Painel Maximizado (alterado configuração em preferências: abrir atalhos de teclado)

#### Navegador

`Ctrl+J` - console</br>
`Ctrl+I` - aplicativo</br>
`Ctrl+O` - favoritos</br>

#### Matar um processo via terminal

```sh
## Executar projeto
netlify dev
# ou
netlify dev --context production

## Matar execução do projeto
ctrl + c

## Exemplo para matar um processo executando na porta 8888
lsof -i :8888
kill -9 <PID>

## Parar execução
ctrl + z

## Listar todos os processos com nome netlify e encontrar o ID
ps aux | grep netlify

## Retornar a execução do processo em segundo plano (background)
bg

## Listar os trabalhos em segundo plano
jobs
# matar o trabalho em segundo plano substituindo "n" pelo número do trabalho associado ao processo que você deseja encerrar.
kill %n


```