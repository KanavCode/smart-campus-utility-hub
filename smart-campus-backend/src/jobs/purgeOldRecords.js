const cron = require('node-cron');
const knex = require('knex')(require('../knexfile.js'));
cron.schedule('0 0 * * 0', async () => {
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  await knex('users').where('deleted_at', '<', fiveYearsAgo).del();
});
