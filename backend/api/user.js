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
        const userId = req.params.id;
        
        // Validação do parâmetro ID
        if (!userId || isNaN(userId) || userId <= 0) {
            return res.status(400).json({ error: 'ID de usuário inválido' });
        }
        
        app.db('users')
            .select('id', 'name', 'email', 'admin')
            .where({ id: parseInt(userId) })
            .whereNull('deleted_at') // Busca apenas usuários que não foram excluídos
            .first()
            .then(user => {
                if (!user) {
                    return res.status(404).json({ error: 'Usuário não encontrado' });
                }
                res.json(user);
            })
            .catch(err => {
                console.error('Erro ao buscar usuário por ID:', err);
                res.status(500).json({ error: 'Erro interno do servidor' });
            });
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
            const userId = req.params.id;
            
            // Validação do parâmetro ID
            if (!userId || isNaN(userId) || userId <= 0) {
                return res.status(400).json({ error: 'ID de usuário inválido' });
            }
            
            const parsedUserId = parseInt(userId);
            
            // Verifica se o usuário existe antes de tentar remover
            const userExists = await app.db('users')
                .where({ id: parsedUserId })
                .whereNull('deleted_at')
                .first();
                
            if (!userExists) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            
            // Busca os cartões do usuário que ainda estão com votação em aberto
            const activeCards = await app.db('cards') 
                .where({ userID: parsedUserId })
                .where('voting_end', '>', new Date()) // Verifica se a data de término da votação é maior que agora
                .andWhere('status', 'active') // Verifica se o status do card está ativo
            
            if(activeCards && activeCards.length > 0) {
                return res.status(400).json({ error: 'Usuário possui cards com votação ainda em aberto' });
            }

            const rowsDeleted = await app.db('users') // Exclui o usuário
                .update({ deleted_at: new Date() }) // Define a data de exclusão
                .where({ id: parsedUserId }) // Filtra pelo id do usuário
                .whereNull('deleted_at') // Garante que o usuário não foi excluído anteriormente
            
            existsOrError(rowsDeleted, 'Usuário não foi encontrado') // Verifica se o usuário foi encontrado

            res.status(204).send() // Retorna status 204 se a exclusão for bem sucedida
        } catch(msg) {
            console.error('Erro ao remover usuário:', msg);
            return res.status(400).json({ error: typeof msg === 'string' ? msg : 'Erro ao remover usuário' });
        }
    }

    // Função para atualizar apenas o perfil do usuário (nome)
    const updateProfile = async (req, res) => {
        console.log('🔄 Tentativa de atualizar perfil');
        console.log('📄 Body da requisição:', req.body);
        console.log('👤 Usuário autenticado:', req.user);
        
        const { name } = req.body;
        const userId = req.user?.id; // Obtém o ID do usuário logado

        try {
            if (!userId) {
                console.log('❌ ID do usuário não encontrado no token');
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }

            existsOrError(name, 'Nome não informado');
            
            if (name.trim().length < 2) {
                return res.status(400).json({ error: 'Nome deve ter pelo menos 2 caracteres' });
            }
            
            if (name.trim().length > 100) {
                return res.status(400).json({ error: 'Nome deve ter no máximo 100 caracteres' });
            }

            console.log(`🔧 Atualizando usuário ID ${userId} com nome: ${name.trim()}`);

            // Verifica se o usuário existe antes de atualizar
            const userExists = await app.db('users')
                .where({ id: userId })
                .whereNull('deleted_at')
                .first();
                
            if (!userExists) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            const rowsUpdated = await app.db('users')
                .update({ name: name.trim() })
                .where({ id: userId })
                .whereNull('deleted_at');

            console.log(`✅ Linhas atualizadas: ${rowsUpdated}`);

            existsOrError(rowsUpdated, 'Usuário não encontrado');

            // Busca os dados atualizados do usuário
            const updatedUser = await app.db('users')
                .select('id', 'name', 'email', 'admin')
                .where({ id: userId })
                .whereNull('deleted_at')
                .first();

            console.log('📋 Dados do usuário atualizado:', updatedUser);

            res.json(updatedUser);
        } catch (msg) {
            console.log('❌ Erro ao atualizar perfil:', msg);
            return res.status(400).json({ error: typeof msg === 'string' ? msg : 'Erro ao atualizar perfil' });
        }
    };

    // Função para alterar senha do usuário
    const changePassword = async (req, res) => {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user.id;

        try {
            existsOrError(currentPassword, 'Senha atual não informada');
            existsOrError(newPassword, 'Nova senha não informada');
            existsOrError(confirmPassword, 'Confirmação de senha não informada');
            equalsOrError(newPassword, confirmPassword, 'Senhas não conferem');

            if (newPassword.length < 6) {
                return res.status(400).send('Nova senha deve ter pelo menos 6 caracteres');
            }

            // Busca o usuário atual para verificar a senha
            const user = await app.db('users')
                .where({ id: userId })
                .whereNull('deleted_at')
                .first();

            existsOrError(user, 'Usuário não encontrado');

            // Verifica se a senha atual está correta
            const isValidPassword = bcrpt.compareSync(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(400).send('Senha atual incorreta');
            }

            // Verifica se a nova senha é diferente da atual
            const isSamePassword = bcrpt.compareSync(newPassword, user.password);
            if (isSamePassword) {
                return res.status(400).send('A nova senha deve ser diferente da atual');
            }

            // Criptografa a nova senha
            const encryptedPassword = encryptPassword(newPassword);

            // Atualiza a senha no banco
            const rowsUpdated = await app.db('users')
                .update({ password: encryptedPassword })
                .where({ id: userId })
                .whereNull('deleted_at');

            existsOrError(rowsUpdated, 'Erro ao atualizar senha');

            res.status(204).send();
        } catch (msg) {
            return res.status(400).send(msg);
        }
    };

    // Função para deletar a própria conta
    const deleteOwnAccount = async (req, res) => {
        const userId = req.user.id;

        try {
            // Verifica se o usuário tem cards com votação ativa
            const activeCards = await app.db('cards')
                .where({ userID: userId })
                .where('voting_end', '>', new Date())
                .andWhere('status', 'active');

            if (activeCards && activeCards.length > 0) {
                return res.status(400).send('Você possui ideias com votação ainda em aberto. Aguarde o término das votações para deletar sua conta.');
            }

            // Soft delete do usuário
            const rowsDeleted = await app.db('users')
                .update({ deleted_at: new Date() })
                .where({ id: userId })
                .whereNull('deleted_at');

            existsOrError(rowsDeleted, 'Usuário não encontrado');

            res.status(204).send();
        } catch (msg) {
            return res.status(400).send(msg);
        }
    };


    // Retorna as funções save e get
    return { save, get , getById , remove , getTotalUsers , updateProfile , changePassword , deleteOwnAccount } 
}