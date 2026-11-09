const mongoose = require('mongoose');

const notificacaoSchema = new mongoose.Schema({
  destinatario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true
  },
  autor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  publicacao_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publicacao',
    required: true
  },
  tipo: {
    type: String,
    enum: ['curtida', 'comentario'],
    required: true
  },
  texto: {
    type: String,
    trim: true,
    maxlength: 160,
    default: ''
  },
  lida_em: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'criado_em', updatedAt: false },
  collection: 'notificacoes'
});

notificacaoSchema.index({ destinatario_id: 1, criado_em: -1 });

module.exports = mongoose.model('Notificacao', notificacaoSchema);
