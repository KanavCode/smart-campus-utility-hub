const { Model } = require('objection');

class User extends Model {
  static get tableName() { return 'users'; }

  // Global filter to exclude soft-deleted records
  static query(builder) { return (builder || super.query()).whereNull('deleted_at'); }

  // Soft delete method
  async softDelete(trx) { 
    return await this.$query(trx).patch({ deleted_at: new Date() }); 
  }
}

module.exports = User;
