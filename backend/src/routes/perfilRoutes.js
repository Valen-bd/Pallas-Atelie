const express = require('express');
const router = express.Router();
const { Artista, Empresa, Oportunidade, Parceria } = require('../models');

// Listar todos os artistas cadastrados
router.get('/artistas', async (req, res) => {
  try {
    const artistas = await Artista.find().sort({ criado_em: -1 });
    res.json({ sucesso: true, dados: artistas });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

// Listar todas as empresas cadastradas
router.get('/empresas', async (req, res) => {
  try {
    const empresas = await Empresa.find().sort({ criado_em: -1 });
    res.json({ sucesso: true, dados: empresas });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

// Listar todas as oportunidades abertas
router.get('/oportunidades', async (req, res) => {
  try {
    const oportunidades = await Oportunidade.find({ status: 'aberta' })
      .populate('empresa_id', 'nome_fantasia razao_social endereco email')
      .sort({ data_publicacao: -1 });
    res.json({ sucesso: true, dados: oportunidades });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
});

module.exports = router;
