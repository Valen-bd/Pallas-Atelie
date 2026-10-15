const mongoose = require('mongoose');

const oportunidadeSchema = new mongoose.Schema({
  empresa_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    required: [true, 'O ID da empresa criadora é obrigatório.']
  },
  cargo: {
    type: String,
    required: [true, 'O cargo/título da oportunidade é obrigatório.'],
    trim: true,
    maxlength: 100
  },
  funcao: {
    type: String,
    required: [true, 'A descrição da função/atividades é obrigatória.'],
    trim: true,
    maxlength: 1000
  },
  salario: {
    type: mongoose.Schema.Types.Decimal128
  },
  horario: {
    type: String,
    trim: true,
    maxlength: 100
  },
  tipo_arte: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: {
      values: ['aberta', 'em_analise', 'encerrada'],
      message: 'Status deve ser aberta, em_analise ou encerrada.'
    },
    default: 'aberta'
  },
  data_publicacao: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em' },
  collection: 'oportunidades'
});

// Índices
oportunidadeSchema.index({ empresa_id: 1, status: 1 });
oportunidadeSchema.index({ status: 1, data_publicacao: -1 });
oportunidadeSchema.index({ tipo_arte: 1, status: 1 });

module.exports = mongoose.model('Oportunidade', oportunidadeSchema);
