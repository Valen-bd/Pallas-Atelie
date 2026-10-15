const mongoose = require('mongoose');

const parceriaSchema = new mongoose.Schema({
  projeto: {
    type: String,
    required: [true, 'O nome do projeto é obrigatório.'],
    trim: true,
    maxlength: 150
  },
  objetivo: {
    type: String,
    required: [true, 'O objetivo da parceria é obrigatório.'],
    trim: true,
    maxlength: 1000
  },
  artistas_ids: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artista'
    }],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'A parceria deve conter pelo menos um artista associado.'
    },
    required: [true, 'Pelo menos um artista deve estar associado à parceria.']
  },
  empresa_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    default: null
  },
  oportunidade_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Oportunidade',
    default: null
  },
  status: {
    type: String,
    enum: {
      values: ['em_negociacao', 'ativa', 'concluida', 'cancelada'],
      message: 'Status deve ser em_negociacao, ativa, concluida ou cancelada.'
    },
    default: 'em_negociacao'
  },
  data_inicio: {
    type: Date
  },
  data_fim: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em' },
  collection: 'parcerias'
});

// Índices
parceriaSchema.index({ artistas_ids: 1, status: 1 });
parceriaSchema.index({ empresa_id: 1, status: 1 });
parceriaSchema.index({ oportunidade_id: 1 });

module.exports = mongoose.model('Parceria', parceriaSchema);
