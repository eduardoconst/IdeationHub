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

        if(!req.originalUrl.startsWith('/users')) users.admin = false // Se a URL original não começar com /users, o usuário não é admin
        if(!req.user || !req.user.admin) users.admin = false // Se não houver um usuário logado ou se o usuário não for admin, o usuário não é admin
            

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
                .whereNull('deleted_at') // Busca apenas usuários que não foram excluídos
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
            .whereNull('deleted_at') // Busca apenas usuários que não foram excluídos
            .then(users => res.json(users)) 
            .catch(err => res.status(500).send(err)) 
    }  
    
    // Função que busca um usuário por id
    const getById = (req, res) => { 
        app.db('users')
            .select('id', 'name', 'email', 'admin')
            .where({ id: req.params.id })
            .whereNull('deleted_at') // Busca apenas usuários que não foram excluídos
            .first()
            .then(user => res.json(user))
            .catch(err => res.status(500).send(err))
    }

    // Função que busca o total de usuários cadastrados
    const getTotalUsers = async (req, res) => {
        try {
            const result = await app.db('users')
                .whereNull('deleted_at') // Conta apenas usuários que não foram excluídos
                .count('* as total');
            
            const total = parseInt(result[0].total) || 0;
            res.json({ total });
        } catch (error) {
            console.error('Erro ao buscar total de usuários:', error);
            res.status(500).send('Erro interno do servidor');
        }
    };


    const remove = async (req, res) => { 
        try{
            // Busca os cartões do usuário que ainda estão com votação em aberto
            const activeCards = await app.db('cards') 
                .where({ userID: req.params.id })
                .where('voting_end', '>', new Date()) // Verifica se a data de término da votação é maior que agora
                .andWhere('status', 'active') // Verifica se o status do card está ativo
            
            if(activeCards && activeCards.length > 0) {
                return res.status(400).send('Usuário possui cards com votação ainda em aberto')
            }

            const rowsDeleted = await app.db('users') // Exclui o usuário
                .update({ deleted_at: new Date() }) // Define a data de exclusão
                .where({ id: req.params.id }) // Filtra pelo id do usuário
                .whereNull('deleted_at') // Garante que o usuário não foi excluído anteriormente
            
            existsOrError(rowsDeleted, 'Usuário não foi encontrado') // Verifica se o usuário foi encontrado

            res.status(204).send() // Retorna status 204 se a exclusão for bem sucedida
        } catch(msg) {
            return res.status(400).send(msg) // Retorna status 400 se houver erro
        }
    }


    // Retorna as funções save e get
    return { save, get , getById , remove , getTotalUsers } 
}