const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite Connected: Database connection established successfully.');
    await sequelize.sync({ force: true });
    console.log('Database models synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
