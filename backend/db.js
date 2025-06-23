

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // important pour Railway
  }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connexion échouée à PostgreSQL', err);
  } else {
    console.log('Connexion réussie à PostgreSQL', res.rows);
  }
});


module.exports = pool;
