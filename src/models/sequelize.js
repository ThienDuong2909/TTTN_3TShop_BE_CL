const { Sequelize } = require('sequelize');
const dbConfig = require('../configs/database');

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false,
    define: {
      freezeTableName: true,
      timestamps: false,
    },
  }
);

module.exports = sequelize; 