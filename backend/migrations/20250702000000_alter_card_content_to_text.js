/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('cards', table => {
    table.text('content').alter(); // Altera a coluna content de string para text
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('cards', table => {
    table.string('content').alter(); // Volta para string (rollback)
  });
};
