const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rotas de autenticação e cadastros
router.post('/cadastrar-artista', authController.cadastrarArtista);
router.post('/cadastrar-empresa', authController.cadastrarEmpresa);
router.post('/login', authController.login);

module.exports = router;
