const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { cadastroSchema, loginSchema } = require('../utils/schemas/authSchemas');

const router = express.Router();

router.post('/cadastro', validate(cadastroSchema), authController.cadastrar);
router.post('/login', validate(loginSchema), authController.login);
router.get('/perfil', authMiddleware, authController.perfil);
router.put('/perfil', authMiddleware, authController.atualizarPerfil);

module.exports = router;
