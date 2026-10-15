const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  cod_port: {
    type: Number,
    required: [true, 'O código do portfólio é obrigatório.']
  },
  tema: {
    type: String,
    required: [true, 'O tema do portfólio é obrigatório.'],
    trim: true,
    maxlength: 100
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: 500
  },
  imagens: [{
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'A imagem deve ser uma URL válida (HTTP/HTTPS).']
  }],
  data_atualizacao: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

module.exports = portfolioSchema;
