module.exports = middleware => {
    return (req, res, next) => {
        if (req.user && req.user.admin) {
            middleware(req, res, next)
        } else {
            // Corrigir de res.stats para res.status
            res.status(403).send('Usuário não é administrador.')
        }
    }
}