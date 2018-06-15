const express = require('express');
const router = express.Router();
const postController = require('../controllers/posts.controller');
const checkUser = require('../middlewares/checkUser');

router.get('/', postController.index);
router.post('/', postController.create); 
router.get('/:id', postController.read);
router.put('/:id', postController.update);
router.delete('/:id', postController.delete);
router.get('/:id/vote', checkUser, postController.vote)
router.post('/:id/comment', checkUser, postController.addComment);

module.exports = router;