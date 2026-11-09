const mongoose = require('mongoose');

const comentarioSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  autor: {
    type: String,
    required: true,
    trim: true
  },
  texto: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160
  },
  criado_em: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const publicacaoSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'O ID do autor é obrigatório.']
  },
  legenda: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  categoria: {
    type: String,
    trim: true,
    default: 'Portfólio'
  },
  imagem: {
    type: String,
    default: ''
  },
  curtidas: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Usuario',
    default: []
  },
  comentarios: {
    type: [comentarioSchema],
    default: []
  }
}, {
  timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em' },
  collection: 'publicacoes'
});

publicacaoSchema.index({ usuario_id: 1, criado_em: -1 });

module.exports = mongoose.model('Publicacao', publicacaoSchema);
