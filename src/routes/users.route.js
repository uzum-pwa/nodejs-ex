const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const checkAdmin = require('../middlewares/checkAdmin');

router.get('/', userController.index);
router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.post('/', checkAdmin, userController.create);
router.get('/:username', userController.read);
router.put('/:username', userController.update);
router.delete('/:username', checkAdmin, userController.delete);

module.exports = router;