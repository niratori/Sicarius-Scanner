const express = require('express');
const siteController = require('../controllers/siteController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { criarSiteSchema, atualizarSiteSchema } = require('../utils/schemas/siteSchemas');

const router = express.Router();

router.use(authMiddleware);

router.post('/', validate(criarSiteSchema), siteController.criar);
router.get('/', siteController.listar);
router.get('/:id', siteController.obter);
router.put('/:id', validate(atualizarSiteSchema), siteController.atualizar);
router.delete('/:id', siteController.remover);

module.exports = router;
