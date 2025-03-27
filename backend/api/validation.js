module.exports = app => {
    function existsOrError(value, msg){
        if(!value) throw msg // Se o valor não existir, lança o erro
        if(Array.isArray(value) && value.length === 0) throw msg // Se for um array e estiver vazio, lança o erro
        if(typeof value === 'string' && !value.trim()) throw msg // Se for uma string vazia, lança o erro
    }
    
    function notExistsOrError(value, msg){
        try {
            existsOrError(value, msg) // Tenta verificar se o valor existe
        } catch(msg) {
            return // Se não existir, retorna
        }
        throw msg // Se existir, lança o erro
    }
    
    function equalsOrError(valueA, valueB, msg){
        if(valueA !== valueB) throw msg // Se os valores forem diferentes, lança o erro
    }   
    
    return { existsOrError, notExistsOrError, equalsOrError }
} 