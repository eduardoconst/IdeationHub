const bodyParser = require('body-parser'); // Analisa corpos de requisições
const cors = require('cors'); // Permite requisições de qualquer origem

module.exports = app => {
    // Aplica middlewares de log e ID de requisição se disponíveis
    if (app.errorHandler) {
        app.use(app.errorHandler.addRequestId);
        app.use(app.errorHandler.requestLogger);
    }
    
    app.use(bodyParser.json()) // Analisa corpos de requisições JSON
    app.use(cors()) // Permite requisições de qualquer origem
}