exports.up = function (knex, Promise) {
  return knex.schema.createTable('users', table => {
    table.increments();
    table.string('username').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.timestamps(true);
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('users');
};
