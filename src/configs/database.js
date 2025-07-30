const dbConfig = {
  host: process.env.DB_HOST || '103.110.85.87',
  user: process.env.DB_USER || '3tshop',
  password: process.env.DB_PASS || 'um1J!BGc*OhDfK[E',
  database: process.env.DB_NAME || '3tshop_tttn',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  dialect: "mysql",
};
// const dbConfig = {
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASS || '12345',
//   database: process.env.DB_NAME || '3tshop_tttn',
//   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
//   dialect: "mysql",
// };
module.exports = dbConfig;