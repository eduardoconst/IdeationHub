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
                anonymous: vote.anonymous || false,
                showVotes: vote.showVotes || false // Adicionar esta linha para salvar o campo showVotes
            });
    
            return res.status(200).send('Voto registrado com sucesso!');
        } catch (msg) {
            return res.status(400).send(msg);
        }
    };
    

    // Buscar votos (com opção de filtrar por card)
    const get = async (req, res) => {
        try {
            // Query principal para buscar os votos
            let query = app.db('votes')
                .join('cards', 'cards.id', '=', 'votes.cardID')
                .leftJoin('users', 'users.id', '=', 'votes.userID')
                .select(
                    'votes.id',
                    'votes.cardID',
                    'votes.userID',
                    'votes.vote',
                    'votes.anonymous',
                    'cards.title as cardTitle',
                    app.db.raw('CASE WHEN votes.anonymous = true THEN NULL ELSE users.name END as userName')
                );

            // Filtrar por cardID se fornecido na query
            if (req.query.cardID) {
                query = query.where('votes.cardID', req.query.cardID);
            }

            const votes = await query;
            
            // Calcular estatísticas
            const totalVotes = votes.length;
            const positiveVotes = votes.filter(v => v.vote === true).length;
            const negativeVotes = votes.filter(v => v.vote === false).length;
            
            // Obter cards únicos nos resultados
            const uniqueCards = [...new Set(votes.map(v => v.cardID))];
            const cardsInfo = await Promise.all(
                uniqueCards.map(async (cardID) => {
                    const cardVotes = votes.filter(v => v.cardID === cardID);
                    return {
                        cardID,
                        cardTitle: cardVotes[0]?.cardTitle || 'Desconhecido',
                        totalVotes: cardVotes.length,
                        positiveVotes: cardVotes.filter(v => v.vote === true).length,
                        negativeVotes: cardVotes.filter(v => v.vote === false).length
                    };
                })
            );
            
            // Formatar a resposta
            const response = {
                metadata: {
                    totalVotes,
                    positiveVotes,
                    negativeVotes,
                    percentagePositive: totalVotes > 0 ? (positiveVotes / totalVotes * 100).toFixed(1) + '%' : '0%',
                    filterApplied: req.query.cardID ? `cardID=${req.query.cardID}` : 'none',
                    cardsWithVotes: cardsInfo
                },
                votes: votes.map(v => ({
                    id: v.id,
                    cardID: v.cardID,
                    cardTitle: v.cardTitle,
                    userID: v.userID,
                    userName: v.userName || 'Anônimo',
                    vote: v.vote ? 'Positivo' : 'Negativo',
                    anonymous: v.anonymous
                }))
            };

            return res.json(response);
        } catch (err) {
            console.error("Erro ao buscar votos:", err);
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
            console.error("Erro ao agrupar votos:", err);
            return res.status(500).send(err);
        }
    };

    // Buscar apenas votos visíveis (se a coluna showVotes existir)
    const getVisibleVotes = async (req, res) => {
        try {
            // Verificar se a coluna showVotes existe
            const hasShowVotesColumn = await checkIfColumnExists('votes', 'showVotes');
            
            let visibleVotesQuery = app.db('votes')
                .join('cards', 'cards.id', '=', 'votes.cardID')
                .select(
                    'votes.id',
                    'votes.cardID',
                    'votes.vote',
                    'votes.anonymous',
                    'cards.title as cardTitle'
                );
                
            // Só aplicar o filtro se a coluna existir
            if (hasShowVotesColumn) {
                visibleVotesQuery = visibleVotesQuery.where('votes.showVotes', true);
            }

            const visibleVotes = await visibleVotesQuery;
            return res.json(visibleVotes);
        } catch (err) {
            console.error("Erro ao buscar votos visíveis:", err);
            return res.status(500).send(err);
        }
    };
    
    // Função auxiliar para verificar se uma coluna existe
    const checkIfColumnExists = async (tableName, columnName) => {
        try {
            // Consulta a information_schema para verificar se a coluna existe
            const result = await app.db
                .select('column_name')
                .from('information_schema.columns')
                .where({
                    table_name: tableName,
                    column_name: columnName
                });
            
            return result.length > 0;
        } catch (error) {
            console.error(`Erro ao verificar se a coluna ${columnName} existe:`, error);
            return false;
        }
    };

    return { save, get, getGroupedByCard, getVisibleVotes };
};
