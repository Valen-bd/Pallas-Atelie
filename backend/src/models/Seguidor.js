const mongoose = require('mongoose');

const seguidorSchema = new mongoose.Schema({
  seguidor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'O ID do seguidor é obrigatório.']
  },
  seguido_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'O ID do usuário seguido é obrigatório.']
  }
}, {
  timestamps: { createdAt: 'criado_em', updatedAt: false },
  collection: 'seguidores'
});

// Impede que um usuário siga o mesmo perfil mais de uma vez
seguidorSchema.index({ seguidor_id: 1, seguido_id: 1 }, { unique: true });
seguidorSchema.index({ seguido_id: 1 });
seguidorSchema.index({ seguidor_id: 1 });

module.exports = mongoose.model('Seguidor', seguidorSchema);
