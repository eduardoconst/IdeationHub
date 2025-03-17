const app = require('express')() // Importa o express pra dentro da variável app
const consign = require('consign') // Importa o consign pra dentro da variável consign
const db = require('./config/db') // Importa o arquivo db.js

app.db = db // Injeta o db dentro do app

consign() // Inicia o consign
    .then('./config/middlewares.js') // Inclui o arquivo middlewares.js    
    .then('./api') // Inclui o arquivo user.js
    .then('./config/routes.js') // Inclui o arquivo routes.js
    .into(app) // injeta o app dentro dos arquivos acima

app.listen(4000, () => { 
    console.log('Backend executando...')
})