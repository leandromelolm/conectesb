require('dotenv').config();
const test = process.env.TEST_ENV ?? "arquivo main.js";
console.log(`ENV: ${test}`);


// const TEST_ENV_2 = 'TESTE VARIAVEL DE AMBIENTE';
// export default TEST_ENV_2;
