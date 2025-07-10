const {authSecret} = require('../.env');
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');

module.exports = app => {
    const signin = async (req, res) => {
        if(!req.body.email || !req.body.password) {
            return res.status(400).send('Informe usuário e senha!')
        }

        const user = await app.db('users')
            .where({ email: req.body.email })
            .first()

        if(!user) return res.status(400).send('Usuário não encontrado!')

        const isMatch = bcrypt.compareSync(req.body.password, user.password)
        if(!isMatch) return res.status(401).send('Email/Senha inválidos!')

        const now = Math.floor(Date.now() / 1000) // Tempo atual em segundos
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            admin: user.admin,
            iat: now, // Data de emissão do token
            exp: now + (60 * 60 * 24 * 3) // Expiração em 3 dias
        }

        const token = jwt.encode(payload, authSecret);
        console.log('🔐 Login - Payload criado:', payload);
        console.log('🔐 Login - Token gerado (primeiros 50 chars):', token.substring(0, 50) + '...');

        res.json({
            ...payload,
            token
        })
    }

    const validateToken = async (req, res) => {
        const userData = req.body || null
        try{
            if(userData) {
                const token = jwt.decode(userData.token, authSecret)
                if(new Date(token.exp * 1000) > new Date()) {
                    return res.send(true)
                }
            } 
        } catch (e){
            return res.send(false)
        }
    }

    return { signin, validateToken }
};