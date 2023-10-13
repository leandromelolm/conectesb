let dataEnv = '';

function carregarDados() {
    return fetch('config.json')  
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar o arquivo JSON');
            }
            return response.json();
        })
        .then(data => {
            dataEnv = data;
        })
        .catch(error => {
            console.error('Erro:', error);
        });
}

export async function getLink() {
    if (!dataEnv) {
        await carregarDados();
    }
    return dataEnv;
}

// export const LINK_GOOGLE_SCRIPT = '';
// export const LINK_SPREADSHEET = '';


/*
ARQUIVO config.json

{
    "link_google_script": "LINK_SCRIPT_GOOGLE",
    "link_spreadsheet": "LINK_PLANILHA_GOOGLE"
}

*/