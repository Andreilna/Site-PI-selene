const express = require('express');
const router = express.Router();
const PlantaController = require('../controllers-mongodb/plantaController');
const authMiddleware = require('../middleware/auth-mongodb');

// GET /api/v1/plantas - Listar todas plantas
router.get('/', PlantaController.listar);

// GET /api/v1/plantas/:id - Buscar planta específica
router.get('/:id', PlantaController.buscar);

// POST /api/v1/plantas - Criar nova planta
router.post('/', authMiddleware, PlantaController.criar);

// PUT /api/v1/plantas/:id - Atualizar planta
router.put('/:id', authMiddleware, PlantaController.atualizar);

// POST /api/v1/plantas/:id/colheita - Registrar colheita
router.post('/:id/colheita', PlantaController.registrarColheita);

// GET /api/v1/plantas/:id/crescimento - Histórico de crescimento
router.get('/:id/crescimento', PlantaController.crescimento);

module.exports = router;