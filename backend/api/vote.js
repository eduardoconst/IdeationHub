module.exports = app => {
    const { existsOrError } = app.api.validation; // Importa validações

    // Salvar um voto
    const save = async (req, res) => {
        const vote = { ...req.body };
        if (req.params.id) vote.id = req.params.id;
    
        const trx = await app.db.transaction();
        
        try {
            console.log("=== SAVE VOTE DEBUG ===");
            console.log("Dados recebidos:", vote);

            // Validações
            existsOrError(vote.cardID, 'ID do card não informado');
            existsOrError(vote.userID, 'ID do usuário não informado');
            // Corrigir validação do campo vote:
            if (typeof vote.vote !== 'boolean') {
                throw 'Voto não informado ou inválido';
            }
    
            vote.showVotes = vote.showVotes || false;
    
            // Confirma se o card existe
            const cardExists = await trx('cards').where({ id: vote.cardID }).first();
            if (!cardExists) throw 'O card informado não existe';
    
            // Verifica se já existe voto do usuário para este card
            const existingVote = await trx('votes')
                .where({ cardID: vote.cardID, userID: vote.userID })
                .first();
                
            console.log("Voto existente encontrado:", existingVote);
    
            const voteData = {
                cardID: vote.cardID,
                userID: vote.userID,
                vote: vote.vote,
                anonymous: vote.anonymous || false,
                showVotes: vote.showVotes || false
            };
            
            console.log("Dados do voto a serem salvos:", voteData);

            if (existingVote) {
                // Se já existe, atualiza o voto
                console.log("Atualizando voto existente...");
                await trx('votes')
                    .where({ cardID: vote.cardID, userID: vote.userID })
                    .update(voteData);
                
                console.log("Voto atualizado com sucesso!");
            } else {
                // Se não existe, insere novo voto
                console.log("Inserindo novo voto...");
                await trx('votes').insert(voteData);
                
                console.log("Novo voto inserido com sucesso!");
            }
            
            await trx.commit();
            return res.status(200).send(existingVote ? 'Voto atualizado com sucesso!' : 'Voto registrado com sucesso!');
        } catch (msg) {
            await trx.rollback();
            console.error("Erro no save:", msg);
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

    // Busca voto específico de um usuário em um card
    const getUserVoteForCard = async (req, res) => {
        try {
            const { userId, cardId } = req.params;
            
            const vote = await app.db('votes')
                .where({ userID: userId, cardID: cardId })
                .first();
            
            if (vote) {
                res.json({ vote: vote.vote });
            } else {
                res.json({ vote: null });
            }
        } catch (error) {
            console.error('Erro ao buscar voto do usuário:', error);
            res.status(500).send('Erro interno do servidor');
        }
    };

    // Busca contagem de votos para um card específico
    const getCardVoteCount = async (req, res) => {
        try {
            const { cardId } = req.params;
            
            console.log("=== GET CARD VOTE COUNT DEBUG ===");
            console.log(`Buscando contagem para Card ID: ${cardId}`);
            
            const result = await app.db('votes')
                .where({ cardID: cardId })
                .select(
                    app.db.raw('SUM(CASE WHEN vote = true THEN 1 ELSE 0 END) as yes'),
                    app.db.raw('SUM(CASE WHEN vote = false THEN 1 ELSE 0 END) as no')
                );
            
            console.log("Resultado bruto da query:", result);
            
            const count = result[0] || { yes: 0, no: 0 };
            const response = {
                yes: parseInt(count.yes) || 0,
                no: parseInt(count.no) || 0
            };
            
            console.log("Resposta enviada:", response);
            res.json(response);
        } catch (error) {
            console.error('Erro ao buscar contagem de votos:', error);
            res.status(500).send('Erro interno do servidor');
        }
    };

    // Busca total de votos positivos de todos os cards
    const getTotalPositiveVotes = async (req, res) => {
        try {
            const result = await app.db('votes')
                .where({ vote: true })
                .count('* as total');
            
            const total = parseInt(result[0].total) || 0;
            res.json({ total });
        } catch (error) {
            console.error('Erro ao buscar total de votos positivos:', error);
            res.status(500).send('Erro interno do servidor');
        }
    };

    // Remove voto de um usuário em um card específico
    const removeVote = async (req, res) => {
        const trx = await app.db.transaction();
        
        try {
            const { userId, cardId } = req.params;
            
            console.log("=== REMOVE VOTE DEBUG ===");
            console.log(`Removendo voto - Card ID: ${cardId}, User ID: ${userId}`);
            
            // Verifica se o voto existe antes de remover
            const existingVote = await trx('votes')
                .where({ userID: userId, cardID: cardId })
                .first();
                
            console.log("Voto existente antes da remoção:", existingVote);
            
            if (!existingVote) {
                await trx.rollback();
                console.log("Nenhum voto encontrado para remover");
                return res.status(404).json({ message: 'Voto não encontrado' });
            }
            
            const deleted = await trx('votes')
                .where({ userID: userId, cardID: cardId })
                .del();
            
            console.log(`Número de registros removidos: ${deleted}`);
            
            await trx.commit();
            console.log("Voto removido com sucesso!");
            res.json({ message: 'Voto removido com sucesso' });
        } catch (error) {
            await trx.rollback();
            console.error('Erro ao remover voto:', error);
            res.status(500).send('Erro interno do servidor');
        }
    };

    // Função de debug para verificar dados do banco
    const debugVoteData = async (req, res) => {
        try {
            const { cardId, userId } = req.params;
            
            console.log('=== DEBUG VOTE DATA ===');
            console.log(`Card ID: ${cardId}, User ID: ${userId}`);
            
            // Busca todos os votos para este card
            const allVotes = await app.db('votes')
                .where({ cardID: cardId });
            
            console.log('Todos os votos para este card:', allVotes);
            
            // Busca voto específico do usuário
            const userVote = await app.db('votes')
                .where({ cardID: cardId, userID: userId })
                .first();
                
            console.log('Voto específico do usuário:', userVote);
            
            // Conta votos
            const voteCount = await app.db('votes')
                .where({ cardID: cardId })
                .select(
                    app.db.raw('SUM(CASE WHEN vote = true THEN 1 ELSE 0 END) as yes'),
                    app.db.raw('SUM(CASE WHEN vote = false THEN 1 ELSE 0 END) as no')
                );
                
            console.log('Contagem de votos:', voteCount[0]);
            
            res.json({
                allVotes,
                userVote,
                count: voteCount[0]
            });
        } catch (error) {
            console.error('Erro no debug:', error);
            res.status(500).json({ error: error.message });
        }
    };

    return { save, get, getGroupedByCard, getVisibleVotes, getUserVoteForCard, getCardVoteCount, getTotalPositiveVotes, removeVote, debugVoteData };
};

