const knex = require('knex')
const config = require('./knexfile')

const db = knex(config)

async function testAdmin() {
    try {
        console.log('🔄 Testando funcionalidades administrativas...')
        
        // 1. Verificar se há usuários no banco
        const users = await db('users').select('*')
        console.log(`📊 Total de usuários: ${users.length}`)
        
        if (users.length > 0) {
            console.log('👥 Usuários encontrados:')
            users.forEach(user => {
                console.log(`  - ${user.name} (${user.email}) - Admin: ${user.admin ? 'Sim' : 'Não'}`)
            })
        } else {
            console.log('⚠️  Nenhum usuário encontrado no banco')
            
            // Criar um usuário admin de teste
            const testUser = {
                name: 'Admin Teste',
                email: 'admin@test.com',
                password: '$2b$10$hashAleatorio', // senha fictícia
                admin: true
            }
            
            await db('users').insert(testUser)
            console.log('✅ Usuário admin de teste criado')
        }
        
        // 2. Verificar cards
        const cards = await db('cards').select('*')
        console.log(`💡 Total de cards: ${cards.length}`)
        
        // 3. Verificar votos
        const votes = await db('votes').select('*')
        console.log(`🗳️  Total de votos: ${votes.length}`)
        
        // 4. Testar a função de estatísticas diretamente
        const totalUsersResult = await db('users')
            .whereNull('deleted_at')
            .count('id as count')
            .first()
        const totalUsers = parseInt(totalUsersResult.count) || 0

        const totalIdeasResult = await db('cards')
            .count('id as count')
            .first()
        const totalIdeas = parseInt(totalIdeasResult.count) || 0

        const totalVotesResult = await db('votes')
            .count('id as count')
            .first()
        const totalVotes = parseInt(totalVotesResult.count) || 0

        const stats = {
            totalUsers,
            totalIdeas,
            totalVotes
        }
        
        console.log('📈 Estatísticas calculadas:', stats)
        
        console.log('✅ Teste concluído com sucesso!')
        
    } catch (error) {
        console.error('❌ Erro no teste:', error)
    } finally {
        await db.destroy()
    }
}

testAdmin()
