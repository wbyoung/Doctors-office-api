'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('doctors', function(table) {
    table.increments('id').primary();
    table.string('name');
    table.string('specialty')
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('doctors');
};
