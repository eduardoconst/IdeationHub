module.exports = app => {
  const knex = app.db; // Usando o knex do app

  // Relatório do dashboard (só admins)
  const getDashboardMetrics = async (req, res) => {
    try {
      // Estatísticas gerais
      const totalUsers = await knex('users').whereNull('deleted_at').count('id as count').first();
      const totalIdeas = await knex('cards').whereNull('deleted_at').count('id as count').first();
      const totalVotes = await knex('votes').count('id as count').first();
      const totalAdmins = await knex('users').where('admin', true).whereNull('deleted_at').count('id as count').first();

      // Atividade recente (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentUsers = await knex('users')
        .whereNull('deleted_at')
        .where('created_at', '>=', thirtyDaysAgo)
        .count('id as count')
        .first();

      const recentIdeas = await knex('cards')
        .whereNull('deleted_at')
        .where('created_at', '>=', thirtyDaysAgo)
        .count('id as count')
        .first();

      const recentVotes = await knex('votes')
        .where('created_at', '>=', thirtyDaysAgo)
        .count('id as count')
        .first();

      // Tipos de votos
      const positiveVotes = await knex('votes').where('vote', true).count('id as count').first();
      const negativeVotes = await knex('votes').where('vote', false).count('id as count').first();

      // Top 5 ideias mais votadas
      const topIdeas = await knex('cards as c')
        .select('c.id', 'c.title', 'u.name as author_name')
        .join('users as u', 'c.user_id', 'u.id')
        .leftJoin('votes as v', 'c.id', 'v.card_id')
        .whereNull('c.deleted_at')
        .groupBy('c.id', 'c.title', 'u.name')
        .orderBy(knex.raw('COUNT(v.id)'), 'desc')
        .limit(5)
        .count('v.id as vote_count');

      // Top 5 usuários mais ativos
      const topUsers = await knex('users as u')
        .select('u.id', 'u.name', 'u.email')
        .leftJoin('cards as c', 'u.id', 'c.user_id')
        .leftJoin('votes as v', 'u.id', 'v.user_id')
        .whereNull('u.deleted_at')
        .groupBy('u.id', 'u.name', 'u.email')
        .orderBy(knex.raw('COUNT(c.id) + COUNT(v.id)'), 'desc')
        .limit(5)
        .count('c.id as ideas_count')
        .count('v.id as votes_count');

      res.json({
        overview: {
          totalUsers: parseInt(totalUsers.count),
          totalIdeas: parseInt(totalIdeas.count),
          totalVotes: parseInt(totalVotes.count),
          totalAdmins: parseInt(totalAdmins.count),
          positiveVotes: parseInt(positiveVotes.count),
          negativeVotes: parseInt(negativeVotes.count)
        },
        recentActivity: {
          newUsers: parseInt(recentUsers.count),
          newIdeas: parseInt(recentIdeas.count),
          newVotes: parseInt(recentVotes.count)
        },
        topIdeas: topIdeas.map(idea => ({
          ...idea,
          vote_count: parseInt(idea.vote_count)
        })),
        topUsers: topUsers.map(user => ({
          ...user,
          ideas_count: parseInt(user.ideas_count),
          votes_count: parseInt(user.votes_count),
          total_activity: parseInt(user.ideas_count) + parseInt(user.votes_count)
        }))
      });
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  // Relatório de usuários (só admins)
  const getUsersReport = async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      let query = knex('users as u')
        .select(
          'u.id',
          'u.name',
          'u.email',
          'u.admin',
          'u.created_at',
          knex.raw('COUNT(DISTINCT c.id) as ideas_count'),
          knex.raw('COUNT(DISTINCT v.id) as votes_count')
        )
        .leftJoin('cards as c', function() {
          this.on('u.id', 'c.user_id').andOn('c.deleted_at', 'IS', knex.raw('NULL'));
        })
        .leftJoin('votes as v', 'u.id', 'v.user_id')
        .whereNull('u.deleted_at')
        .groupBy('u.id', 'u.name', 'u.email', 'u.admin', 'u.created_at')
        .orderBy('u.created_at', 'desc');

      if (search) {
        query = query.where(function() {
          this.where('u.name', 'ilike', `%${search}%`)
              .orWhere('u.email', 'ilike', `%${search}%`);
        });
      }

      const users = await query.limit(limit).offset(offset);
      const totalCount = await knex('users').whereNull('deleted_at').count('id as count').first();

      res.json({
        users: users.map(user => ({
          ...user,
          ideas_count: parseInt(user.ideas_count),
          votes_count: parseInt(user.votes_count)
        })),
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalCount.count / limit),
          total_items: parseInt(totalCount.count),
          items_per_page: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar relatório de usuários:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  // Relatório de ideias (só admins)
  const getIdeasReport = async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      let query = knex('cards as c')
        .select(
          'c.id',
          'c.title',
          'c.content',
          'c.created_at',
          'u.name as author_name',
          'u.email as author_email',
          knex.raw('COUNT(CASE WHEN v.vote = ? THEN 1 END) as positive_votes', [true]),
          knex.raw('COUNT(CASE WHEN v.vote = ? THEN 1 END) as negative_votes', [false]),
          knex.raw('COUNT(v.id) as total_votes')
        )
        .join('users as u', 'c.user_id', 'u.id')
        .leftJoin('votes as v', 'c.id', 'v.card_id')
        .whereNull('c.deleted_at')
        .groupBy('c.id', 'c.title', 'c.content', 'c.created_at', 'u.name', 'u.email')
        .orderBy('c.created_at', 'desc');

      if (search) {
        query = query.where(function() {
          this.where('c.title', 'ilike', `%${search}%`)
              .orWhere('c.content', 'ilike', `%${search}%`)
              .orWhere('u.name', 'ilike', `%${search}%`);
        });
      }

      const ideas = await query.limit(limit).offset(offset);
      const totalCount = await knex('cards').whereNull('deleted_at').count('id as count').first();

      res.json({
        ideas: ideas.map(idea => ({
          ...idea,
          positive_votes: parseInt(idea.positive_votes),
          negative_votes: parseInt(idea.negative_votes),
          total_votes: parseInt(idea.total_votes)
        })),
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalCount.count / limit),
          total_items: parseInt(totalCount.count),
          items_per_page: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar relatório de ideias:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  // Relatório de engajamento (só admins)
  const getEngagementReport = async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);

      // Atividade por dia
      const dailyActivity = await knex('votes')
        .select(knex.raw('DATE(created_at) as date'))
        .count('id as votes_count')
        .where('created_at', '>=', daysAgo)
        .groupBy(knex.raw('DATE(created_at)'))
        .orderBy('date', 'asc');

      // Ideias mais engajadas
      const topEngagedIdeas = await knex('cards as c')
        .select('c.id', 'c.title', 'u.name as author_name')
        .join('users as u', 'c.user_id', 'u.id')
        .leftJoin('votes as v', 'c.id', 'v.card_id')
        .whereNull('c.deleted_at')
        .where('c.created_at', '>=', daysAgo)
        .groupBy('c.id', 'c.title', 'u.name')
        .orderBy(knex.raw('COUNT(v.id)'), 'desc')
        .limit(10)
        .count('v.id as engagement_score');

      // Usuários mais engajados
      const topEngagedUsers = await knex('users as u')
        .select('u.id', 'u.name', 'u.email')
        .leftJoin('votes as v', 'u.id', 'v.user_id')
        .whereNull('u.deleted_at')
        .where('v.created_at', '>=', daysAgo)
        .groupBy('u.id', 'u.name', 'u.email')
        .orderBy(knex.raw('COUNT(v.id)'), 'desc')
        .limit(10)
        .count('v.id as votes_given');

      // Taxa de engajamento geral
      const totalIdeas = await knex('cards').whereNull('deleted_at').count('id as count').first();
      const totalVotes = await knex('votes').count('id as count').first();
      const engagementRate = totalIdeas.count > 0 ? (totalVotes.count / totalIdeas.count).toFixed(2) : 0;

      res.json({
        period: {
          days: parseInt(days),
          start_date: daysAgo.toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        },
        overall: {
          engagement_rate: parseFloat(engagementRate),
          total_ideas: parseInt(totalIdeas.count),
          total_votes: parseInt(totalVotes.count)
        },
        dailyActivity: dailyActivity.map(day => ({
          date: day.date,
          votes_count: parseInt(day.votes_count)
        })),
        topEngagedIdeas: topEngagedIdeas.map(idea => ({
          ...idea,
          engagement_score: parseInt(idea.engagement_score)
        })),
        topEngagedUsers: topEngagedUsers.map(user => ({
          ...user,
          votes_given: parseInt(user.votes_given)
        }))
      });
    } catch (error) {
      console.error('Erro ao buscar relatório de engajamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  // Relatório pessoal do usuário
  const getUserPersonalReport = async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Buscar dados do usuário
      const userStats = await knex('users')
        .select('name', 'email', 'created_at')
        .where('id', userId)
        .first();

      if (!userStats) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Estatísticas das ideias do usuário
      const userIdeas = await knex('cards')
        .select('id', 'title', 'content', 'created_at')
        .where('user_id', userId)
        .where('deleted_at', null)
        .orderBy('created_at', 'desc');

        // Votos dados pelo usuário
        const userVotes = await knex('votes as v')
          .select('v.vote', 'v.created_at', 'c.title as idea_title', 'u.name as author_name')
          .join('cards as c', 'v.cardID', 'c.id')
          .join('users as u', 'c.user_id', 'u.id')
          .where('v.userID', userId)
          .orderBy('v.created_at', 'desc');

        // Votos recebidos nas ideias do usuário
        const receivedVotes = await knex('votes as v')
          .select('v.vote', 'v.created_at', 'c.title as idea_title', 'u.name as voter_name')
          .join('cards as c', 'v.cardID', 'c.id')
          .join('users as u', 'v.userID', 'u.id')
          .where('c.user_id', userId)
          .orderBy('v.created_at', 'desc');      // Calcular estatísticas das ideias
        const ideasWithStats = await Promise.all(
          userIdeas.map(async (idea) => {
            const votes = await knex('votes')
              .select('vote')
              .where('cardID', idea.id);
            
            const positiveVotes = votes.filter(v => v.vote === true).length;
            const negativeVotes = votes.filter(v => v.vote === false).length;          return {
            ...idea,
            positive_votes: positiveVotes,
            negative_votes: negativeVotes,
            total_votes: positiveVotes + negativeVotes
          };
        })
      );

      // Estatísticas gerais
      const totalIdeas = userIdeas.length;
      const totalVotesGiven = userVotes.length;
      const totalVotesReceived = receivedVotes.length;
        const positiveVotesGiven = userVotes.filter(v => v.vote === true).length;
        const positiveVotesReceived = receivedVotes.filter(v => v.vote === true).length;      res.json({
        user: userStats,
        stats: {
          totalIdeas,
          totalVotesGiven,
          totalVotesReceived,
          positiveVotesGiven,
          positiveVotesReceived,
          engagementRate: totalIdeas > 0 ? (totalVotesReceived / totalIdeas).toFixed(2) : 0
        },
        ideas: ideasWithStats,
        votesGiven: userVotes.slice(0, 20), // Últimos 20 votos
        votesReceived: receivedVotes.slice(0, 20) // Últimos 20 votos
      });
    } catch (error) {
      console.error('Erro ao buscar relatório pessoal:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  // Relatório específico de uma ideia (só admins)
  const getIdeaReport = async (req, res) => {
    try {
      const ideaId = req.params.id;
      
      // Validação do parâmetro ID
      if (!ideaId || isNaN(ideaId) || ideaId <= 0) {
        return res.status(400).json({ error: 'ID de ideia inválido' });
      }
      
      const parsedIdeaId = parseInt(ideaId);
      console.log(`🔍 Buscando relatório para ideia ID: ${parsedIdeaId}`);
      
      // Buscar dados da ideia
      const idea = await knex('cards as c')
        .select('c.id', 'c.title', 'c.content', 'c.created_at', 'u.name as author_name')
        .join('users as u', 'c.user_id', 'u.id')
        .where('c.id', parsedIdeaId)
        .whereNull('c.deleted_at')
        .whereNull('u.deleted_at')
        .first();

      if (!idea) {
        console.log(`❌ Ideia não encontrada para ID: ${parsedIdeaId}`);
        return res.status(404).json({ error: 'Ideia não encontrada' });
      }
      
      console.log(`✅ Ideia encontrada: ${idea.title}`);

      // Buscar todos os votos da ideia com validação
      const votes = await knex('votes as v')
        .select('v.id', 'v.vote', 'v.created_at', 'v.showVotes', 'u.name as user_name', 'u.email as user_email')
        .join('users as u', 'v.userID', 'u.id')
        .where('v.cardID', parsedIdeaId)
        .whereNull('u.deleted_at')
        .orderBy('v.created_at', 'desc');
        
      console.log(`📊 Encontrados ${votes.length} votos para a ideia`);

      // Calcular estatísticas dos votos
      const positiveVotes = votes.filter(v => v.vote === true).length;
      const negativeVotes = votes.filter(v => v.vote === false).length;
      const totalVotes = votes.length;

      // Adicionar estatísticas à ideia
      const ideaWithStats = {
        ...idea,
        positive_votes: positiveVotes,
        negative_votes: negativeVotes,
        total_votes: totalVotes
      };

      const response = {
        idea: ideaWithStats,
        votes: votes,
        votesBreakdown: {
          positive: positiveVotes,
          negative: negativeVotes,
          total: totalVotes
        }
      };
      
      console.log(`✅ Relatório gerado com sucesso para ideia ${parsedIdeaId}`);
      res.json(response);
    } catch (error) {
      console.error('❌ Erro ao buscar relatório da ideia:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  return { 
    getDashboardMetrics, 
    getUsersReport, 
    getIdeasReport, 
    getEngagementReport, 
    getUserPersonalReport, 
    getIdeaReport 
  };
};
