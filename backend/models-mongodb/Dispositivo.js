const mongoose = require('mongoose');

const dispositivoSchema = new mongoose.Schema({

  mac_address: {
    type: String,
    required: [true, 'MAC address é obrigatório'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [
      /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/,
      'MAC address inválido'
    ]
  },

  nome: {
    type: String,
    default: 'Novo Dispositivo',
    maxlength: 50,
    trim: true
  },

  tipo: {
    type: String,
    enum: ['ESP32_SENSORES', 'ESP32_CAM'],
    default: 'ESP32_SENSORES'
  },

  localizacao: {
    type: String,
    maxlength: 100,
    trim: true
  },

  planta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Planta'
  },

  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório']
  },

  // 🔥 RELAÇÃO COM LEITURAS (ESSENCIAL)
  leituras: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Leitura'
  }],

  ativo: {
    type: Boolean,
    default: true
  },

  online: {
    type: Boolean,
    default: false
  },

  ultima_comunicacao: {
    type: Date,
    default: Date.now
  },

  configuracao: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }

}, {

  timestamps: {
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  }

});

// ==========================
// ÍNDICES (performance)
// ==========================

dispositivoSchema.index({ usuario: 1 });
dispositivoSchema.index({ tipo: 1 });
dispositivoSchema.index({ online: 1 });
dispositivoSchema.index({ planta: 1 });

module.exports = mongoose.model(
  'Dispositivo',
  dispositivoSchema
);