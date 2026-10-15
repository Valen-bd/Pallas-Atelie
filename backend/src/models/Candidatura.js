const mongoose = require('mongoose');

const candidaturaSchema = new mongoose.Schema({
  oportunidade_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Oportunidade',
    required: [true, 'O ID da oportunidade é obrigatório.']
  },
  artista_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artista',
    required: [true, 'O ID do artista candidato é obrigatório.']
  },
  mensagem: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: {
      values: ['inscrito', 'em_analise', 'aprovado', 'rejeitado'],
      message: 'Status deve ser inscrito, em_analise, aprovado ou rejeitado.'
    },
    default: 'inscrito'
  },
  data_candidatura: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em' },
  collection: 'candidaturas'
});

// Índice único para impedir candidaturas duplicadas do mesmo artista na mesma oportunidade
candidaturaSchema.index({ oportunidade_id: 1, artista_id: 1 }, { unique: true });
candidaturaSchema.index({ artista_id: 1, status: 1 });

module.exports = mongoose.model('Candidatura', candidaturaSchema);
