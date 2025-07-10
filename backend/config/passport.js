const {authSecret} = require('../.env')
const passport = require('passport')
const passportJwt = require('passport-jwt')
const {Strategy, ExtractJwt} = passportJwt

module.exports = app => {
    const params = {
        secretOrKey: authSecret,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()

    }
    const strategy = new Strategy(params,(payload, done) => {
        console.log('🔍 Passport - Token payload recebido:', payload);
        
        app.db('users')
            .where({id: payload.id})
            .whereNull('deleted_at') // Adiciona verificação de usuários não deletados
            .first()
            .then(user => {
                console.log('🔍 Passport - Usuário encontrado no banco:', user);
                
                if (user) {
                    const authUser = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        admin: user.admin
                    };
                    console.log('✅ Passport - Autenticação bem-sucedida:', authUser);
                    done(null, authUser);
                } else {
                    console.log('❌ Passport - Usuário não encontrado ou deletado');
                    done(null, false);
                }
            })
            .catch(err => {
                console.error('❌ Passport - Erro na consulta:', err);
                done(err, false);
            })
    })

    passport.use(strategy)

    return {
        authenticate: () => passport.authenticate('jwt', {session: false})
    }
}