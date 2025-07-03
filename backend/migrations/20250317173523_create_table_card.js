/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('cards', table => {
    table.increments('id').primary();
    table.string('title', 255).notNull(); // Título limitado a 255 caracteres
    table.text('content').notNull(); // Mudança de string para text para permitir textos longos
    table.timestamp('voting_start').notNull(); // Data e hora de início da votação
    table.timestamp('voting_end').notNull();   // Data e hora de término da votação
    table.varchar('status').defaultTo('active'); // Status do card (ativo ou inativo)
    table.integer('userID').references('id').inTable('users').notNull(); 
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('cards');
};
