const express = require('express');
const relatorioController = require('../controllers/relatorioController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/scan/:id', relatorioController.gerarRelatorioScan);

module.exports = router;
