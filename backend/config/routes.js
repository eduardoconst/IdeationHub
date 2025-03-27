module.exports = app => {
    app.route('/users') // Define a rota /users
        .post(app.api.user.save) // Recebe um POST
        .get(app.api.user.get) // Recebe um GET

    app.route('/users/:id') // Define a rota /users/:id
        .put(app.api.user.save) // Recebe um PUT    
        .get(app.api.user.getById) // Recebe um GET

    app.route('/cards') // Define a rota /cards
        .post(app.api.card.save) // Recebe um POST
        .get(app.api.card.get) // Recebe um GET

    app.route('/cards/:id') // Define a rota /cards/:id
        .put(app.api.card.save) // Recebe um PUT
        .delete(app.api.card.remove) // Recebe um DELETE
        .get(app.api.card.getById) // Recebe um GET

}