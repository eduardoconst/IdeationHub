const mongoose = require('mongoose');

const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || '27017';
const mongoDb = process.env.MONGO_DB || 'votes';
const mongoUri = `mongodb://${mongoHost}:${mongoPort}/${mongoDb}`; // Conexão com o MongoDB

mongoose.connect(mongoUri)
    .catch(e => {
        const msg = "ERRO! Não foi possível conectar ao MongoDB!";
        console.log('\x1b[41m%s\x1b[37m',msg,'\x1b[0m');
    })