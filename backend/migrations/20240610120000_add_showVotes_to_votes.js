exports.up = function(knex) {
  return knex.schema.table('votes', table => {
    table.boolean('showVotes').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.table('votes', table => {
    table.dropColumn('showVotes');
  });
};
