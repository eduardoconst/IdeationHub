module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation // Importa as funções existsOrError e notExistsOrError do módulo app.api.validation

    const save = (req, res) => { // Função que salva um card
        const card = { ...req.body }
        if(req.params.id) card.id = req.params.id

        try {
            existsOrError(card.title, 'Título não informado')
            existsOrError(card.content, 'Conteúdo não informado')
            existsOrError(card.userID, 'Autor não informado')
            existsOrError(card.voting_start, 'Data de início da votação não informada')
            existsOrError(card.voting_end, 'Data de término da votação não informada')
            
            // Validações de tamanho
            if (card.title && card.title.length > 100) {
                throw 'Título deve ter no máximo 100 caracteres'
            }
            if (card.content && card.content.length > 1000) {
                throw 'Conteúdo deve ter no máximo 1000 caracteres'
            }
        } catch(msg) {
            return res.status(400).send(msg)
        }

        if(card.id) {
            app.db('cards') // Atualiza o card
                .update(card)
                .where({ id: card.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else { 
            app.db('cards') // Insere o card
                .insert(card)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const remove = async (req, res) => { // Função que remove um card
        try {
            const card = await app.db('cards') // Busca o card no banco de dados
                .where({ id: req.params.id })
                .first()

            existsOrError(card, 'Card não encontrado.') // Verifica se o card foi encontrado

            const now = new Date()
            const votingEnd = new Date(card.voting_end) // Converte a data de término da votação para o formato Date

            // Verifica se a votação ainda está em andamento
            if (votingEnd > now) {
                // Busca o usuário no banco de dados
                const user = await app.db('users')  
                    .select('id', 'admin')
                    .where({ id: req.user.id }) // `req.user.id` deve conter o ID do usuário autenticado
                    .first()

                existsOrError(user, 'Usuário não encontrado.') // Verifica se o usuário foi encontrado

                // Verifica se o usuário é o criador do card ou um administrador
                if (user.id !== card.userID && !user.admin) {
                    return res.status(403).send('Você não tem permissão para excluir este card.')
                }
            }

            // Exclui o card
            await app.db('cards')
                .where({ id: req.params.id })
                .del()

            res.status(204).send() // Retorna sucesso após a exclusão
        } catch (msg) {
            return res.status(400).send(msg) // Retorna erro de validação
        }
    }

    const get = (req, res) => { // Função que busca os cards
        app.db('cards')
            .join('users', 'users.id', '=', 'cards.userID') // Faz o join com a tabela de usuários
            .select(
                'cards.id',
                'cards.title',
                'cards.content',
                'users.name as userName', // Seleciona o nome do usuário
                'cards.voting_start',
                'cards.voting_end'
            )
            .then(cards => res.json(cards))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => { // Função que busca um card por id
        app.db('cards')
            .join('users', 'users.id', '=', 'cards.userID')
            .select(
                'cards.id',
                'cards.title',
                'cards.content',
                'cards.userID',
                'users.name as userName',
                'cards.voting_start',
                'cards.voting_end'
            )
            .where('cards.id', req.params.id)
            .first()
            .then(card => res.json(card))
            .catch(err => res.status(500).send(err))
    }

    const close = async (req, res) => { // Função que encerra um card
        try {
            const card = await app.db('cards')
                .where({ id: req.params.id })
                .first();

            existsOrError(card, 'Card não encontrado.');

            const user = await app.db('users')
                .select('id', 'admin')
                .where({ id: req.user.id }) // `req.user.id` deve conter o ID do usuário autenticado
                .first();

            existsOrError(user, 'Usuário não encontrado.');

            // Verifica se o usuário é o criador do card ou um administrador
            if (user.id !== card.userID && !user.admin) {
                return res.status(403).send('Você não tem permissão para encerrar este card.');
            }

            // Atualiza o status do card para "encerrado"
            await app.db('cards')
                .update({ status: 'encerrado' })
                .where({ id: req.params.id });

            res.status(200).send('Card encerrado com sucesso.');
        } catch (msg) {
            return res.status(400).send(msg);
        }
    };

    const finalizeExpiredCards = async () => {
        try {
            const now = new Date();

            // Busca os cards cuja data de término da votação já passou
            const expiredCards = await app.db('cards')
                .where('voting_end', '<', now)
                .andWhere('status', '!=', 'encerrado');

            for (const card of expiredCards) {
                // Atualiza o status do card para "encerrado"
                await app.db('cards')
                    .update({ status: 'encerrado' })
                    .where({ id: card.id });
            }
        } catch (err) {
            console.error('Erro ao finalizar cards expirados:', err);
        }
    };

    return { save, remove, get, getById, close, finalizeExpiredCards } // Retorna as funções save, remove, get, getById, close e finalizeExpiredCards
}