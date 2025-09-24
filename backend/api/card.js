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
            // Validação de autenticação
            if (!req.user || !req.user.id) {
                return res.status(401).send('Usuário não autenticado.')
            }

            // Busca o usuário autenticado no banco de dados
            const user = await app.db('users')  
                .select('id', 'admin')
                .where({ id: req.user.id })
                .whereNull('deleted_at') // Garantir que o usuário não foi deletado
                .first()

            if (!user) {
                return res.status(401).send('Usuário não encontrado ou inativo.')
            }

            // Busca o card no banco de dados
            const card = await app.db('cards')
                .where({ id: req.params.id })
                .first()

            existsOrError(card, 'Card não encontrado.') // Verifica se o card foi encontrado

            // VALIDAÇÃO DE SEGURANÇA: Verifica se o usuário é o criador do card ou um administrador
            // Converte ambos para number para garantir comparação correta
            const isOwner = Number(user.id) === Number(card.userID)
            const isAdmin = user.admin === true || user.admin === 1

            if (!isOwner && !isAdmin) {
                return res.status(403).send('Você não tem permissão para excluir este card. Apenas o criador ou administradores podem excluir.')
            }

            // Log de segurança
            console.log(`🔒 Exclusão de card autorizada:`, {
                cardId: card.id,
                cardTitle: card.title,
                cardOwner: card.userID,
                requestUser: user.id,
                isOwner,
                isAdmin,
                userEmail: user.email
            })

            // Exclui o card
            await app.db('cards')
                .where({ id: req.params.id })
                .del()

            res.status(204).send() // Retorna sucesso após a exclusão
        } catch (msg) {
            console.error('Erro na exclusão do card:', msg)
            return res.status(400).send(msg) // Retorna erro de validação
        }
    }

    const get = async (req, res) => { // Função que busca os cards
        try {
            // Busca os cards
            const cards = await app.db('cards')
                .join('users', 'users.id', '=', 'cards.userID') // Faz o join com a tabela de usuários
                .select(
                    'cards.id',
                    'cards.title',
                    'cards.content',
                    'cards.userID', // Adiciona o userID que estava faltando
                    'users.name as userName', // Seleciona o nome do usuário
                    'cards.voting_start',
                    'cards.voting_end'
                );

            // Para cada card, busca os votos
            const cardsWithVotes = await Promise.all(cards.map(async (card) => {
                const votes = await app.db('votes')
                    .where({ cardID: card.id })
                    .select('vote');
                
                const yesVotes = votes.filter(v => v.vote === true).length;
                const noVotes = votes.filter(v => v.vote === false).length;
                
                return {
                    ...card,
                    votes: {
                        yes: yesVotes,
                        no: noVotes
                    }
                };
            }));

            res.json(cardsWithVotes);
        } catch (err) {
            console.error('Erro ao buscar cards com votos:', err);
            res.status(500).send(err);
        }
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