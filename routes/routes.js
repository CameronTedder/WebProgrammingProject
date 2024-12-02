const express = require('express');
const router = express.Router();
const db = require('../db');
const userController = require("../controllers/userController");
const postController = require("../controllers/postController");

//User routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/getUserName', userController.getUserName);
router.get('/getCurrentUser', userController.getCurrentUser);
router.post('/logout', userController.logout);

//Post routes
router.post('/addPost', postController.addPost);
router.delete('/removePost/:post_id', postController.removePost);
router.post('/addComment', postController.addComment);
router.delete('/removeComment/:comment_id', postController.removeComment);
router.get('/posts', postController.getPostsByUser);
router.get('/comments', postController.getCommentsForPost);


module.exports = router;