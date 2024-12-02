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
router.post('/signout', userController.signout);
router.get("/check-auth", userController.checkAuth);

//Profile routes
router.get('/profile', userController.getUserProfile);  
router.put('/profile', userController.updateUserProfile);

//Notification routes
router.get('/notifications', userController.getUserNotifications);
router.post('/notifications/:notificationId/read', userController.markNotificationAsRead);

//Post routes
router.post('/addPost', postController.addPost);
router.delete('/removePost/:post_id', postController.removePost);
router.post('/addComment', postController.addComment);
router.delete('/removeComment/:comment_id', postController.removeComment);
router.get('/posts', postController.getPostsByUser);
router.get('/comments', postController.getCommentsForPost);
router.get('/allPosts', postController.getAllPosts);


module.exports = router;