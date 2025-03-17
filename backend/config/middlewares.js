const bodyParser = require('body-parser'); // Analisa corpos de requisições
const cors = require('cors'); // Permite requisições de qualquer origem

module.exports = app => {
    app.use(bodyParser.json()) // Analisa corpos de requisições JSON
    app.use(cors()) // Permite requisições de qualquer origem
}