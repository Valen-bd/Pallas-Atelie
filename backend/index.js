require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');

const app = express();
const port = process.env.PORT || 3000;

// Conectar ao MongoDB
connectDB();

// Caminho para a pasta public com os arquivos HTML
const publicPath = path.join(__dirname, 'public');

// Middlewares para JSON e arquivos estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));

// Rotas da API conectadas ao MongoDB
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api', require('./src/routes/perfilRoutes'));

// Endpoint para verificar status da API e conexão do banco
app.get('/api/status', (req, res) => {
  const dbStatusMap = {
    0: 'desconectado',
    1: 'conectado',
    2: 'conectando',
    3: 'desconectando'
  };
  res.json({
    sistema: 'Pallas Ateliê Backend',
    status: 'online',
    banco_mongodb: dbStatusMap[mongoose.connection.readyState] || 'desconhecido',
    timestamp: new Date()
  });
});

// Rota para a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'home.html'));
});

// Rota para a home do sistema
app.get('/home', (req, res) => {
  res.sendFile(path.join(publicPath, 'home.html'));
});

// Rota alternativa para a home do sistema
app.get('/home.html', (req, res) => {
  res.sendFile(path.join(publicPath, 'home.html'));
});

// Rota para cadastro
app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(publicPath, 'cadastrar.html'));
});

// Rota para cadastro de artista
app.get('/cadastro/artista', (req, res) => {
  res.sendFile(path.join(publicPath, 'cadastrar-artista.html'));
});

// Rota para cadastro de empresa
app.get('/cadastro/empresa', (req, res) => {
  res.sendFile(path.join(publicPath, 'cadastrar-empresa.html'));
});

// Rota para página sobre
app.get('/sobre', (req, res) => {
  res.sendFile(path.join(publicPath, 'sobre.html'));
});

// Rota para página contato
app.get('/contato', (req, res) => {
  res.sendFile(path.join(publicPath, 'contato.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
