module.exports = app => {
    const { existsOrError } = app.api.validation; // Importa validações

    // Salvar um voto
    const save = async (req, res) => {
        const vote = { ...req.body };
        if (req.params.id) vote.id = req.params.id;
    
        try {
            console.log("Dados recebidos:", vote); // Verificar os dados enviados no POST
    
            // Validações
            existsOrError(vote.cardID, 'ID do card não informado');
            existsOrError(vote.userID, 'ID do usuário não informado');
            existsOrError(vote.vote, 'Voto não informado');
    
            if (typeof vote.vote !== 'boolean') {
                throw 'O voto deve ser booleano (true/false)';
            }
    
            vote.showVotes = vote.showVotes || false;
    
            // Confirma se o card existe
            const cardExists = await app.db('cards').where({ id: vote.cardID }).first();
            if (!cardExists) throw 'O card informado não existe';
    
            // Impede voto duplicado do mesmo usuário no mesmo card
            const existingVote = await app.db('votes')
                .where({ cardID: vote.cardID, userID: vote.userID })
                .first();
    
            if (existingVote) {
                throw 'Usuário já votou neste card';
            }
    
            // Inserção no banco
            await app.db('votes').insert({
                cardID: vote.cardID,
                userID: vote.userID,
                vote: vote.vote,
                anonymous: vote.anonymous || false, // Valor padrão caso não seja enviado
            });
    
            return res.status(200).send('Voto registrado com sucesso!');
        } catch (msg) {
            return res.status(400).send(msg);
        }
    };
    

    // Buscar votos (com opção de filtrar por card)
    const get = async (req, res) => {
        try {
            let query = app.db('votes')
                .join('cards', 'cards.id', '=', 'votes.cardID')
                .select(
                    'votes.id',
                    'votes.cardID',
                    'votes.vote',
                    'votes.showVotes',
                    'cards.title as cardTitle'
                );

            if (req.query.cardID) {
                query = query.where('votes.cardID', req.query.cardID);
            }

            const votes = await query;
            return res.json(votes); // Retorna os votos em formato de lista
        } catch (err) {
            return res.status(500).send(err);
        }
    };

    // Buscar votos agrupados por card
    const getGroupedByCard = async (req, res) => {
        try {
            const groupedVotes = await app.db('votes')
                .select('votes.cardID', 'cards.title as cardTitle')
                .count('votes.vote as totalVotes')
                .sumRaw("CASE WHEN votes.vote = true THEN 1 ELSE 0 END as yesVotes")
                .sumRaw("CASE WHEN votes.vote = false THEN 1 ELSE 0 END as noVotes")
                .join('cards', 'cards.id', '=', 'votes.cardID')
                .groupBy('votes.cardID', 'cards.title');

            return res.json(groupedVotes);
        } catch (err) {
            return res.status(500).send(err);
        }
    };

    // Buscar apenas votos visíveis
    const getVisibleVotes = async (req, res) => {
        try {
            const visibleVotes = await app.db('votes')
                .join('cards', 'cards.id', '=', 'votes.cardID')
                .select(
                    'votes.id',
                    'votes.cardID',
                    'votes.vote',
                    'votes.showVotes',
                    'cards.title as cardTitle'
                )
                .where('votes.showVotes', true);

            return res.json(visibleVotes);
        } catch (err) {
            return res.status(500).send(err);
        }
    };

    return { save, get, getGroupedByCard, getVisibleVotes };
};
