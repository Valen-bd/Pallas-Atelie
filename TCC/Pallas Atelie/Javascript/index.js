const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Caminho para a pasta public com os arquivos HTML
const publicPath = path.join(__dirname, 'public');

// Servir arquivos estáticos (CSS, imagens, etc)
app.use(express.static(publicPath));

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
