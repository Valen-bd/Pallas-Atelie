const mongoose = require('mongoose');

const enderecoSchema = new mongoose.Schema({
  rua: {
    type: String,
    required: [true, 'A rua é obrigatória.'],
    trim: true,
    maxlength: 100
  },
  numero: {
    type: String,
    required: [true, 'O número é obrigatório.'],
    trim: true,
    maxlength: 20
  },
  bairro: {
    type: String,
    required: [true, 'O bairro é obrigatório.'],
    trim: true,
    maxlength: 80
  },
  cidade: {
    type: String,
    required: [true, 'A cidade é obrigatória.'],
    trim: true,
    maxlength: 80
  },
  uf: {
    type: String,
    required: [true, 'A UF é obrigatória.'],
    trim: true,
    uppercase: true,
    minlength: 2,
    maxlength: 2
  },
  cep: {
    type: String,
    required: [true, 'O CEP é obrigatório.'],
    trim: true,
    match: [/^[0-9]{8}$/, 'O CEP deve conter exatamente 8 dígitos numéricos.']
  },
  pais: {
    type: String,
    required: true,
    default: 'Brasil',
    trim: true,
    maxlength: 50
  },
  localizacao: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [0, 0]
    }
  }
}, { _id: false });

module.exports = enderecoSchema;
