const admin = require('./admin') // Importa o middleware de admin

module.exports = app => {

// rotas de autenticação
    app.post('/signup', app.api.user.save)  // cadastro de usuario
    app.post('/signin', app.api.auth.signin) // autenticação do login
    app.post('/validateToken', app.api.auth.validateToken) //validação do token


// rotas de usuario
    // Rota para buscar total de usuários cadastrados (pública para estatísticas)
    app.route('/users/total-count')
        .get(app.api.user.getTotalUsers) // Público para mostrar estatísticas

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

    // Rota para buscar voto específico de um usuário em um card
    app.route('/votes/user/:userId/card/:cardId')
        .get(app.api.vote.getUserVoteForCard) // Público para mostrar votos
        .delete(app.api.vote.removeVote) // Permite remover voto

    // Rota para buscar contagem de votos de um card
    app.route('/votes/count/:cardId')
        .get(app.api.vote.getCardVoteCount) // Público para mostrar contagem

    // Rota para buscar total de votos positivos de todos os cards
    app.route('/votes/total-positive')
        .get(app.api.vote.getTotalPositiveVotes) // Público para mostrar estatísticas

    // Rota de debug (temporária)
    app.route('/votes/debug/:cardId/:userId')
        .get(app.api.vote.debugVoteData) // Debug dos dados de voto

// Rotas administrativas
    // Estatísticas gerais do sistema
    app.route('/admin/stats')
        .all(app.config.passport.authenticate()) // autentica o token
        .get(admin(app.api.admin.getStats)) // apenas admin pode ver estatísticas

    // Gerenciamento de usuários
    app.route('/admin/users')
        .all(app.config.passport.authenticate()) // autentica o token
        .get(admin(app.api.admin.getAllUsers)) // listar todos os usuários

    app.route('/admin/users/:id/promote')
        .all(app.config.passport.authenticate()) // autentica o token
        .patch(admin(app.api.admin.promoteUser)) // promover usuário a admin

    app.route('/admin/users/:id/demote')
        .all(app.config.passport.authenticate()) // autentica o token
        .patch(admin(app.api.admin.demoteUser)) // remover admin de usuário

    app.route('/admin/users/:id/delete')
        .all(app.config.passport.authenticate()) // autentica o token
        .delete(admin(app.api.admin.deleteUser)) // excluir usuário

    // Ações do sistema
    app.route('/admin/refresh')
        .all(app.config.passport.authenticate()) // autentica o token
        .post(admin(app.api.admin.refreshData)) // atualizar cache/dados

    app.route('/admin/export')
        .all(app.config.passport.authenticate()) // autentica o token
        .get(admin(app.api.admin.exportData)) // exportar dados do sistema

    app.route('/admin/cleanup')
        .all(app.config.passport.authenticate()) // autentica o token
        .post(admin(app.api.admin.cleanupOldData)) // limpar dados antigos

    app.route('/admin/backup')
        .all(app.config.passport.authenticate()) // autentica o token
        .post(admin(app.api.admin.createBackup)) // criar backup do sistema


};
