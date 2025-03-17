module.exports = app => { // Exporta uma função que recebe app como parâmetro
    const save = (req, res) => { // Função save que recebe req e res como parâmetros
        res.send('user save') // Envia a mensagem 'user save' como resposta
    }

    return { save }
}