const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  login: {
    type: String,
    required: [true, 'O login é obrigatório.'],
    unique: true,
    trim: true,
    minlength: [3, 'O login deve ter pelo menos 3 caracteres.'],
    maxlength: [50, 'O login não pode ultrapassar 50 caracteres.']
  },
  email: {
    type: String,
    required: [true, 'O e-mail é obrigatório.'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'E-mail inválido.']
  },
  senha_hash: {
    type: String,
    required: [true, 'A senha é obrigatória.']
  },
  tipo_perfil: {
    type: String,
    required: [true, 'O tipo de perfil é obrigatório.'],
    enum: {
      values: ['artista', 'empresa'],
      message: 'Tipo de perfil deve ser artista ou empresa.'
    }
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em' },
  collection: 'usuarios'
});

module.exports = mongoose.model('Usuario', usuarioSchema);
