const express = require('express');
const scanController = require('../controllers/scanController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', scanController.iniciar);
router.get('/', scanController.listar);
router.get('/:id', scanController.obter);
router.post('/:id/reexecutar', scanController.reexecutar);
router.delete('/:id', scanController.remover);

module.exports = router;
