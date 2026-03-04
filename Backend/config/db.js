if (process.env.NODE_ENV === 'test') {
  module.exports = require('./db.test');
} else {
  const { Sequelize } = require('sequelize');
  const path = require('path');

  const pool = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000,
};

  const defaultDbUser =
  process.env.DB_USER ||
  process.env.USER ||
  process.env.USERNAME ||
  'postgres';
  const defaultDbPass = process.env.DB_PASS ?? '';

  const envDialect = (process.env.DB_DIALECT || '').toLowerCase();
  const hasExplicitPostgresEnv = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'].some(
    (key) => process.env[key]
  );
  const allowSqliteFallback =
    String(process.env.DB_FALLBACK_SQLITE || 'true').toLowerCase() === 'true';
  const useSqliteByDefault =
    !envDialect &&
    !hasExplicitPostgresEnv &&
    process.env.NODE_ENV !== 'production' &&
    allowSqliteFallback;
  const dialect = envDialect || (useSqliteByDefault ? 'sqlite' : 'postgres');

  let sequelize;
  if (dialect === 'sqlite') {
    const storage =
      process.env.DB_STORAGE ||
      path.join(__dirname, '..', 'data', 'tasktracker.sqlite');
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage,
      logging: false,
      pool,
    });
  } else {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'tasktracker',
      defaultDbUser,
      defaultDbPass,
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        pool,
      }
    );
  }

  const connectDB = async () => {
    try {
      await sequelize.authenticate();
      console.log('PostgreSQL Connected: Database connection established successfully.');

      await sequelize.sync({ alter: true });
      console.log('Database models synchronized.');
    } catch (error) {
      console.error('Unable to connect to the database:', error.message);
      process.exit(1);
    }
  };

  module.exports = { sequelize, connectDB };
}
