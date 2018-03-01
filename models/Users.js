const Model = require('./BaseModel');
const Password = require('objection-password')();
const Unique = require('objection-unique')({
  fields: ['username', 'email'],
  identifiers: ['id']
});

class Users extends Password(Unique(Model)) {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['username', 'email', 'password'],

      properties: {
        id: { type: 'integer' },

        username: {
          type: 'string',
          minLength: 3,
          maxLength: 255
        },

        email: {
          type: 'string',
          format: 'email'
        },

        password: {
          type: 'string',
          minLength: 8
        }
      }
    };
  }
}

module.exports = Users;
