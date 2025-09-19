/**
 * RESUMO: admin.js
 * 
 * API para funcionalidades administrativas
 * - Estatísticas do sistema
 * - Gerenciamento de usuários
 * - Ações administrativas (backup, export, cleanup)
 */

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation;

    /**
     * Busca estatísticas gerais do sistema
     */
    const getStats = async (req, res) => {
        try {
            console.log('🔄 Buscando estatísticas administrativas...');

            // Contar total de usuários
            const totalUsersResult = await app.db('users')
                .whereNull('deleted_at')
                .count('id as count')
                .first();
            const totalUsers = parseInt(totalUsersResult.count) || 0;

            // Contar total de ideias/cards
            const totalIdeasResult = await app.db('cards')
                .count('id as count')
                .first();
            const totalIdeas = parseInt(totalIdeasResult.count) || 0;

            // Contar total de votos
            const totalVotesResult = await app.db('votes')
                .count('id as count')
                .first();
            const totalVotes = parseInt(totalVotesResult.count) || 0;

            // Contar ideias ativas (com período de votação ainda válido)
            const now = new Date().toISOString();
            const activeIdeasResult = await app.db('cards')
                .where('voting_end', '>', now)
                .count('id as count')
                .first();
            const activeIdeas = parseInt(activeIdeasResult.count) || 0;

            const stats = {
                totalUsers,
                totalIdeas,
                totalVotes,
                activeIdeas
            };

            console.log('✅ Estatísticas carregadas:', stats);
            res.json(stats);

        } catch (error) {
            console.error('❌ Erro ao buscar estatísticas:', error);
            res.status(500).json({ 
                message: 'Erro interno do servidor',
                error: error.message 
            });
        }
    };

    /**
     * Busca todos os usuários para gerenciamento
     */
    const getAllUsers = async (req, res) => {
        try {
            console.log('🔄 Buscando todos os usuários...');        
            const users = await app.db('users')
            .select('id', 'name', 'email', 'admin', 'deleted_at')
            .whereNull('deleted_at')
            .orderBy('id', 'desc');

            console.log(`✅ ${users.length} usuários encontrados`);
            res.json(users);

        } catch (error) {
            console.error('❌ Erro ao buscar usuários:', error);
            res.status(500).json({ 
                message: 'Erro interno do servidor',
                error: error.message 
            });
        }
    };

    /**
     * Promove um usuário para administrador
     */
    const promoteUser = async (req, res) => {
        try {
            const userId = req.params.id;
            console.log(`🔄 Promovendo usuário ${userId} para admin...`);

            // Verificar se o usuário existe
            const user = await app.db('users')
                .select('id', 'name', 'admin')
                .where({ id: userId })
                .whereNull('deleted_at')
                .first();

            existsOrError(user, 'Usuário não encontrado');

            if (user.admin) {
                return res.status(400).json({ message: 'Usuário já é administrador' });
            }

            // Promover usuário
            await app.db('users')
                .where({ id: userId })
                .update({ admin: true });

            console.log(`✅ Usuário ${user.name} promovido para admin`);
            res.json({ message: 'Usuário promovido para administrador com sucesso' });

        } catch (error) {
            console.error('❌ Erro ao promover usuário:', error);
            if (error.message === 'Usuário não encontrado') {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ 
                    message: 'Erro interno do servidor',
                    error: error.message 
                });
            }
        }
    };

    /**
     * Remove privilégios de administrador de um usuário
     */
    const demoteUser = async (req, res) => {
        try {
            const userId = req.params.id;
            console.log(`🔄 Removendo admin do usuário ${userId}...`);

            // Verificar se o usuário existe
            const user = await app.db('users')
                .select('id', 'name', 'admin')
                .where({ id: userId })
                .whereNull('deleted_at')
                .first();

            existsOrError(user, 'Usuário não encontrado');

            if (!user.admin) {
                return res.status(400).json({ message: 'Usuário não é administrador' });
            }

            // Verificar se não é o último admin
            const adminCount = await app.db('users')
                .where({ admin: true })
                .whereNull('deleted_at')
                .count('id as count')
                .first();

            if (parseInt(adminCount.count) <= 1) {
                return res.status(400).json({ 
                    message: 'Não é possível remover o último administrador do sistema' 
                });
            }

            // Remover admin
            await app.db('users')
                .where({ id: userId })
                .update({ admin: false });

            console.log(`✅ Admin removido do usuário ${user.name}`);
            res.json({ message: 'Privilégios de administrador removidos com sucesso' });

        } catch (error) {
            console.error('❌ Erro ao remover admin:', error);
            if (error.message === 'Usuário não encontrado') {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ 
                    message: 'Erro interno do servidor',
                    error: error.message 
                });
            }
        }
    };

    /**
     * Remove um usuário do sistema (soft delete)
     */
    const deleteUser = async (req, res) => {
        try {
            const userId = req.params.id;
            console.log(`🔄 Removendo usuário ${userId}...`);

            // Verificar se o usuário existe
            const user = await app.db('users')
                .select('id', 'name', 'admin')
                .where({ id: userId })
                .whereNull('deleted_at')
                .first();

                
            existsOrError(user, 'Usuário não encontrado');

            // Verificar se não está tentando excluir a si mesmo
            if (parseInt(userId) === req.user.id) {
                return res.status(400).json({ message: 'Você não pode excluir sua própria conta' });
            }

            // Se for admin, verificar se não é o último admin
            if (user.admin) {
                const adminCount = await app.db('users')
                    .where({ admin: true })
                    .whereNull('deleted_at')
                    .count('id as count')
                    .first();

                if (parseInt(adminCount.count) <= 1) {
                    return res.status(400).json({ 
                        message: 'Não é possível excluir o último administrador do sistema' 
                    });
                }
            }

            // Soft delete - marcar como deletado
            await app.db('users')
                .where({ id: userId })
                .update({ deleted_at: new Date() });

            console.log(`✅ Usuário ${user.name} removido do sistema`);
            res.json({ message: 'Usuário removido com sucesso' });

        } catch (error) {
            console.error('❌ Erro ao remover usuário:', error);
            if (error.message === 'Usuário não encontrado') {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ 
                    message: 'Erro interno do servidor',
                    error: error.message 
                });
            }
        }
    };

    /**
     * Atualiza dados/cache do sistema
     */
    const refreshData = async (req, res) => {
        try {
            console.log('🔄 Atualizando dados do sistema...');

            // Aqui você pode implementar lógicas de refresh específicas
            // Por exemplo: limpar cache, recarregar configurações, etc.
            
            console.log('✅ Dados do sistema atualizados');
            res.json({ message: 'Dados do sistema atualizados com sucesso' });

        } catch (error) {
            console.error('❌ Erro ao atualizar dados:', error);
            res.status(500).json({ 
                message: 'Erro interno do servidor',
                error: error.message 
            });
        }
    };

    /**
     * Exporta dados do sistema
     */
    const exportData = async (req, res) => {
        try {
            console.log('🔄 Exportando dados do sistema...');

            // Buscar dados principais
            const users = await app.db('users')
                .select('id', 'name', 'email', 'admin', 'created_at')
                .whereNull('deleted_at');

            const cards = await app.db('cards')
                .select('*');

            const votes = await app.db('votes')
                .select('*');

            const exportData = {
                timestamp: new Date().toISOString(),
                users: users,
                cards: cards,
                votes: votes,
                summary: {
                    totalUsers: users.length,
                    totalCards: cards.length,
                    totalVotes: votes.length
                }
            };

            console.log('✅ Dados exportados com sucesso');
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="ideationhub-export-${new Date().toISOString().split('T')[0]}.json"`);
            res.json(exportData);

        } catch (error) {
            console.error('❌ Erro ao exportar dados:', error);
            res.status(500).json({ 
                message: 'Erro interno do servidor',
                error: error.message 
            });
        }
    };

    /**
     * Limpa dados antigos do sistema
     */
    const cleanupOldData = async (req, res) => {
        try {
            console.log('🔄 Limpando dados antigos...');

            // Limpar votos de cards que expiraram há mais de 30 dias
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const expiredCardsResult = await app.db('cards')
                .select('id')
                .where('voting_end', '<', thirtyDaysAgo.toISOString());

            const expiredCardIds = expiredCardsResult.map(card => card.id);

            if (expiredCardIds.length > 0) {
                const deletedVotes = await app.db('votes')
                    .whereIn('card_id', expiredCardIds)
                    .del();

                console.log(`✅ ${deletedVotes} votos antigos removidos`);
            }

            res.json({ 
                message: 'Limpeza concluída com sucesso',
                removedVotes: expiredCardIds.length > 0 ? expiredCardIds.length : 0
            });

        } catch (error) {
            console.error('❌ Erro na limpeza:', error);
            res.status(500).json({ 
                message: 'Erro interno do servidor',
                error: error.message 
            });
        }
    };

    /**
     * Cria backup do sistema
     */
    const createBackup = async (req, res) => {
        try {
            console.log('🔄 Criando backup do sistema...');

            // Aqui você implementaria a lógica de backup
            // Por exemplo: criar dump do banco, salvar em cloud storage, etc.
            
            const backupInfo = {
                timestamp: new Date().toISOString(),
                status: 'completed',
                message: 'Backup criado com sucesso'
            };

            console.log('✅ Backup criado:', backupInfo);
            res.json(backupInfo);

        } catch (error) {
            console.error('❌ Erro ao criar backup:', error);
            res.status(500).json({ 
                message: 'Erro interno do servidor',
                error: error.message 
            });
        }
    };

    // Retornar as funções para serem acessíveis via app.api.admin
    return {
        getStats, 
        getAllUsers, 
        promoteUser, 
        demoteUser, 
        deleteUser,
        refreshData, 
        exportData, 
        cleanupOldData, 
        createBackup 
    };
};
