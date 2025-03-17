module.exports = app => {
    app.route('/user') // Define a rota /users
        .post(app.api.user.save) // Recebe um POST
}