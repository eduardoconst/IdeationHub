const express = require('express');
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
});

sequelize.authenticate()
  .then(() => {
    console.log('Connected to Postgres');
  })
  .catch((err) => {
    console.error('Unable to connect to Postgres:', err);
  });

app.get('/', (req, res) => {
  res.send('IdeationHub API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});