const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '123456',
  database: process.env.DB_NAME || '3tshop_tttn',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3309,
  dialect: "mysql",
};
module.exports = dbConfig;