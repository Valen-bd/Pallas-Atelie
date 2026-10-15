const mongoose = require('mongoose');
const enderecoSchema = require('./common/enderecoSchema');
const portfolioSchema = require('./common/portfolioSchema');

const empresaSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'O ID de usuário é obrigatório.'],
    unique: true
  },
  cnpj: {
    type: String,
    required: [true, 'O CNPJ é obrigatório.'],
    unique: true,
    trim: true,
    match: [/^[0-9]{14}$/, 'O CNPJ deve conter exatamente 14 dígitos numéricos.']
  },
  razao_social: {
    type: String,
    required: [true, 'A razão social é obrigatória.'],
    trim: true,
    maxlength: 150
  },
  nome_fantasia: {
    type: String,
    required: [true, 'O nome fantasia é obrigatório.'],
    trim: true,
    maxlength: 100
  },
  responsavel: {
    type: String,
    required: [true, 'O nome do responsável é obrigatório.'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'O e-mail de contato corporativo é obrigatório.'],
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
  collection: 'empresas'
});

// Índices
empresaSchema.index({ tipo_arte: 1 });
empresaSchema.index({ 'endereco.localizacao': '2dsphere' });
empresaSchema.index({ 'endereco.cidade': 1, 'endereco.uf': 1 });

module.exports = mongoose.model('Empresa', empresaSchema);
