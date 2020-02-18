require('dotenv/config');

module.exports = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  define: {
    timestamps: true, // cria os campos createdAt e updatedAt
    underscored: true, // aplica o padrao underscore e lower case pras tabelas
    underscoredAll: true, // aplica o padrao underscore e lower case pras colunas
  },
};
