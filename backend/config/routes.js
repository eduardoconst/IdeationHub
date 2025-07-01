const admin = require('./admin') // Importa o middleware de admin

module.exports = app => {

// rotas de autenticação
    app.post('/signup', app.api.user.save)  // cadastro de usuario
    app.post('/signin', app.api.auth.signin) // autenticação do login
    app.post('/validateToken', app.api.auth.validateToken) //validação do token


// rotas de usuario
    app.route('/users')
        .all(app.config.passport.authenticate()) // autentica o token
        .post(app.api.user.save) 
        .get(admin(app.api.user.get)) // apenas admin pode ver todos os usuarios

    app.route('/users/:id') 
        .all(app.config.passport.authenticate()) // autentica o token
        .put(admin(app.api.user.save))
        .get(admin(app.api.user.getById))
        .delete(admin(app.api.user.remove)) // apenas admin pode remover usuarios

// rotas de card
    app.route('/cards')
        .post(app.config.passport.authenticate(), app.api.card.save) // requer autenticação para criar
        .get(app.api.card.get) // público para listar cards

    
    app.route('/cards/:id')
        .put(app.config.passport.authenticate(), admin(app.api.card.save)) // requer auth + admin para editar
        .delete(app.config.passport.authenticate(), admin(app.api.card.remove)) // requer auth + admin para deletar
        .get(app.api.card.getById) // público para visualizar card específico 

// rotas de votos
    app.route('/votes') 
        .all(app.config.passport.authenticate()) // autentica o token
        .post(app.api.vote.save) 
        .get(admin(app.api.vote.get)) 

    // Nova rota: Obter votos agrupados por card
    app.route('/votes/grouped')
        .all(app.config.passport.authenticate()) // autentica o token
        .get(admin(app.api.vote.getGroupedByCard)) 

    // Nova rota: Obter apenas votos visíveis
    app.route('/votes/visible')
        .all(app.config.passport.authenticate()) // autentica o token
        .get(admin(app.api.vote.getVisibleVotes)) 




};
