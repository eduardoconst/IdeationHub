require('dotenv').config(); // <-- Importa variáveis de ambiente do .env
const knex = require('knex');

// Configura a conexão usando o .env
const db = knex({
  client: 'postgresql', // ou 'mysql', 'sqlite3', etc (depende do seu setup)
  connection: process.env.DATABASE_URL, // Usa a variável do .env
});

describe('Teste de Conexão com o Banco de Dados', () => {
  afterAll(async () => {
    await db.destroy(); // Fecha a conexão no final
  });

  it('Deve conectar ao banco e retornar uma resposta', async () => {
    const result = await db.raw('SELECT 1+1 AS result');
    expect(result).toBeDefined(); // Garante que respondeu
  });
});
