const mongoose = require('mongoose');
const enderecoSchema = require('./common/enderecoSchema');
const portfolioSchema = require('./common/portfolioSchema');

const artistaSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'O ID de usuário é obrigatório.'],
    unique: true
  },
  cpf: {
    type: String,
    required: [true, 'O CPF é obrigatório.'],
    unique: true,
    trim: true,
    match: [/^[0-9]{11}$/, 'O CPF deve conter exatamente 11 dígitos numéricos.']
  },
  nome: {
    type: String,
    required: [true, 'O nome é obrigatório.'],
    trim: true,
    maxlength: 120
  },
  nome_artistico: {
    type: String,
    trim: true,
    maxlength: 120
  },
  email: {
    type: String,
    required: [true, 'O e-mail de contato é obrigatório.'],
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'E-mail inválido.']
  },
  fone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  link: {
    type: String,
    trim: true,
    maxlength: 255
  },
  obs: {
    type: String,
    trim: true,
    maxlength: 500
  },
  tipo_arte: {
    type: [String],
    default: []
  },
  endereco: {
    type: enderecoSchema,
    required: [true, 'O endereço é obrigatório.']
  },
  portfolios: {
    type: [portfolioSchema],
    default: []
  }
}, {
  timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em' },
  collection: 'artistas'
});

// Índices
artistaSchema.index({ tipo_arte: 1 });
artistaSchema.index({ 'endereco.localizacao': '2dsphere' });
artistaSchema.index({ 'endereco.cidade': 1, 'endereco.uf': 1 });

module.exports = mongoose.model('Artista', artistaSchema);
