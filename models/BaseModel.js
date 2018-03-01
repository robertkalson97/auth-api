const Model = require('objection').Model;
const moment = require('moment');

class BaseModel extends Model {
  $beforeUpdate () {
    this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
  }

  $beforeInsert () {
    this.created_at = moment().format('YYYY-MM-DD HH:mm:ss');
    this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
  }
}

module.exports = BaseModel
