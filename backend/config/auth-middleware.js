const passport = require('passport');

// Middleware de autenticação usando Passport
const auth = passport.authenticate('jwt', { session: false });

// Middleware para verificar se o usuário é administrador
const admin = (req, res, next) => {
    if (req.user && req.user.admin) {
        next();
    } else {
        res.status(403).json({ error: 'Usuário não é administrador.' });
    }
};

module.exports = { auth, admin };
