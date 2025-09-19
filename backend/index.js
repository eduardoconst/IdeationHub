const app = require('express')() // Importa o express pra dentro da variável app
const consign = require('consign') // Importa o consign pra dentro da variável consign
const db = require('./config/db') // Importa o arquivo db.js

app.db = db // Injeta o db dentro do app

consign() // Inicia o consign
    .then('./config/error-handler.js') // Inclui o handler de erros
    .then('./config/passport.js') // Inclui o arquivo passport.js
    .then('./config/middlewares.js') // Inclui o arquivo middlewares.js 
    .then('./api/validation.js') // Inclui o arquivo validation.js   
    .then('./api') // Inclui o arquivo user.js
    .then('./config/routes.js') // Inclui o arquivo routes.js
    .into(app) // injeta o app dentro dos arquivos acima

// Aplica os middlewares de tratamento de erros
if (app.errorHandler) {
    // Middleware para requisições não encontradas (deve vir antes do error handler)
    app.use(app.errorHandler.notFoundHandler);
    
    // Middleware global de tratamento de erros (deve vir por último)
    app.use(app.errorHandler.errorHandler);
}

// Captura exceções não tratadas para evitar crash
process.on('uncaughtException', (err) => {
    console.error('🚨 Exceção não capturada:', err);
    console.error('Stack trace:', err.stack);
    // Não finaliza o processo em desenvolvimento, apenas loga
    console.log('⚠️ Servidor continua executando...');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Promise rejeitada não tratada:', reason);
    console.error('Promise:', promise);
    console.log('⚠️ Servidor continua executando...');
});

app.listen(4000, '0.0.0.0', () => { 
    console.log('Backend executando em http://0.0.0.0:4000')
    console.log('Acessível via rede em: http://10.20.0.14:4000')
})