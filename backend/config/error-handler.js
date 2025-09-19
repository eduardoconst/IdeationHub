// Middleware para tratamento global de erros
// Previne crashes do servidor e fornece logs detalhados

module.exports = app => {
    // Middleware para capturar erros não tratados
    const errorHandler = (err, req, res, next) => {
        console.error('🚨 Erro não tratado capturado:', {
            error: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method,
            params: req.params,
            query: req.query,
            body: req.body,
            user: req.user || 'Não autenticado',
            timestamp: new Date().toISOString()
        });

        // Se a resposta já foi enviada, apenas passa para o próximo
        if (res.headersSent) {
            return next(err);
        }

        // Determina o status code apropriado
        let statusCode = 500;
        let message = 'Erro interno do servidor';

        if (err.name === 'ValidationError') {
            statusCode = 400;
            message = err.message;
        } else if (err.name === 'UnauthorizedError') {
            statusCode = 401;
            message = 'Token inválido ou expirado';
        } else if (err.code === 'ECONNREFUSED') {
            statusCode = 503;
            message = 'Serviço temporariamente indisponível';
        } else if (err.code === '23505') { // Constraint violation (PostgreSQL)
            statusCode = 409;
            message = 'Dados duplicados';
        } else if (err.code === '23503') { // Foreign key violation
            statusCode = 400;
            message = 'Referência inválida';
        }

        res.status(statusCode).json({
            error: message,
            timestamp: new Date().toISOString(),
            requestId: req.id || 'unknown'
        });
    };

    // Middleware para capturar requisições para rotas não encontradas
    const notFoundHandler = (req, res) => {
        console.log('🔍 Rota não encontrada:', {
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString()
        });

        res.status(404).json({
            error: 'Rota não encontrada',
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    };

    // Middleware para adicionar ID único à requisição (para rastreamento)
    const addRequestId = (req, res, next) => {
        req.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        next();
    };

    // Middleware para log de requisições
    const requestLogger = (req, res, next) => {
        const start = Date.now();
        
        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`📝 ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - ${req.user ? req.user.email : 'Anônimo'}`);
        });
        
        next();
    };

    return {
        errorHandler,
        notFoundHandler,
        addRequestId,
        requestLogger
    };
};
