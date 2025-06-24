/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('votes', table => {
      table.increments('id').primary(); // ID único para cada voto
      table.integer('cardID').references('id').inTable('cards').notNull().onDelete('CASCADE'); // Relaciona o voto ao card
      table.integer('userID').references('id').inTable('users').notNull().onDelete('CASCADE'); // Relaciona o voto ao usuário
      table.boolean('vote').notNull(); // `true` para "sim", `false` para "não"
      table.boolean('anonymous').defaultTo(false); // Indica se o voto é anônimo
      table.boolean('showVotes').defaultTo(false); // Adiciona a coluna showVotes
      table.timestamp('created_at').defaultTo(knex.fn.now()); // Data e hora do voto
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTable('votes');
  };