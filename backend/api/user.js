const bcrpt = require('bcrypt-nodejs') // Importa o módulo bcrypt-nodejs



// Exporta uma função que recebe app como parâmetro
module.exports = app => { 
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation // Importa as funções existsOrError, notExistsOrError e equalsOrError do módulo app.api.validation

    const encryptPassword = password => { 
        const salt = bcrpt.genSaltSync(10) // Gera um salt para a senha
        return bcrpt.hashSync(password, salt) // Retorna a senha criptografada
    }

    const save = async (req, res) => {
        const users = { ...req.body } // Recebe os dados do corpo da requisição
        if(req.params.id) users.id = req.params.id // Se houver um id na requisição, ele é atribuído ao objeto users

        try{
            existsOrError(users.name, 'Nome não informado') 
            existsOrError(users.email, 'E-mail não informado') 
            existsOrError(users.password, 'Senha não informada') 
            existsOrError(users.confirmPassword, 'Confirmação de senha inválida') 
            equalsOrError(users.password, users.confirmPassword, 'Senhas não conferem') 

            const userFromDB = await app.db('users') 
                . where({ email: users.email })
                .first() // Busca o usuário no banco de dados
            if(!users.id){
                notExistsOrError(userFromDB, 'Usuário já cadastrado') // Verifica se o usuário já está cadastrado
            }
        } catch(msg) {
            return res.status(400).send(msg) // Se houver erro, retorna o erro
        }

        users.password = encryptPassword(users.password) // Criptografa a senha
        delete users.confirmPassword  // Deleta a confirmação de senha

        if(users.id) { // Se houver um id no objeto users
            app.db('users') // Atualiza o usuário
                .update(users) 
                .where({ id: users.id })
                .then(_ => res.status(204).send()) // Se a atualização for bem sucedida, retorna status 204
                .catch(err => res.status(500).send(err)) // Se houver erro, retorna status 500
        } else { // Se não houver um id no objeto users
            app.db('users') // Insere o usuário
                .insert(users)
                .then(_ => res.status(204).send()) // Se a inserção for bem sucedida, retorna status 204
                .catch(err => res.status(500).send(err)) // Se houver erro, retorna
        }
    }

    // Função que busca os usuários
    const get = (req, res) => { 
        app.db('users') 
            .select('id', 'name', 'email', 'admin') 
            .then(users => res.json(users)) 
            .catch(err => res.status(500).send(err)) 
    }  
    
    // Função que busca um usuário por id
    const getById = (req, res) => { 
        app.db('users')
            .select('id', 'name', 'email', 'admin')
            .where({ id: req.params.id })
            .first()
            .then(user => res.json(user))
            .catch(err => res.status(500).send(err))
    }

    // Retorna as funções save e get
    return { save, get , getById } 
}