//I think im going to put all routes in one file and use seperate files for the controllers

const db = require('../db');

// Add a new post to the database
exports.addPost = async (req, res) => {
    const { user_id, post_text } = req.body;

    if (!user_id || !post_text) {
        return res.status(400).json({ error: "User ID and post text are required." });
    }

    try {
        // Ensure we're using the promise-based query
        const [result] = await db.promise().query(
            "INSERT INTO Post (user_id, post_text, created_at) VALUES (?, ?, NOW())",
            [user_id, post_text]
        );
        res.status(201).json({ message: "Post added successfully.", post_id: result.insertId });
    } catch (err) {
        console.error("Error adding post:", err);
        res.status(500).json({ error: "Failed to add post.", details: err.message });
    }
};

// Remove a post from the database
exports.removePost = async (req, res) => {
    const { post_id } = req.params;  // Get post_id from the route parameter

    if (!post_id) {
        return res.status(400).json({ error: "Post ID is required." });
    }

    try {
        // Delete the post from the Post table
        const result = await db.promise().query("DELETE FROM Post WHERE post_id = ?", [post_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Post not found." });
        }

        res.status(200).json({ message: "Post removed successfully." });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ error: "Failed to delete post.", details: err.message });
    }
};

// Add a new comment to a post
exports.addComment = async (req, res) => {
    const { post_id, user_id, comment_text } = req.body;
    if (!post_id || !user_id || !comment_text) {
        return res.status(400).json({ error: "Post ID, user ID, and comment text are required." });
    }

    try {
        const result = await db.promise().query(
            "INSERT INTO Comment (post_id, user_id, comment_text, created_at) VALUES (?, ?, ?, NOW())",
            [post_id, user_id, comment_text]
        );
        res.status(201).json({ message: "Comment added successfully.", comment_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: "Failed to add comment.", details: err.message });
    }
};

// Remove a comment from the database
exports.removeComment = async (req, res) => {
    const { comment_id } = req.params;  // Get comment_id from the route parameter

    if (!comment_id) {
        return res.status(400).json({ error: "Comment ID is required." });
    }

    try {
        // Delete the comment from the Comment table
        const result = await db.promise().query("DELETE FROM Comment WHERE comment_id = ?", [comment_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Comment not found." });
        }

        res.status(200).json({ message: "Comment removed successfully." });
    } catch (err) {
        console.error("Error deleting comment:", err);
        res.status(500).json({ error: "Failed to delete comment.", details: err.message });
    }
};

exports.getPostsByUser = async (req, res) => { 
    const { user_id } = req.query;  // Extract user_id from query parameters

    // Ensure user_id is provided
    if (!user_id) {
        return res.status(400).json({ error: "User ID is required." });
    }

    try {
        // Query the database using promise-based API (mysql2)
        const [rows] = await db.promise().query("SELECT * FROM Post WHERE user_id = ? ORDER BY created_at DESC", [user_id]);

        // Log the rows to confirm they are being retrieved
        console.log("Posts retrieved:", rows);

        // Check if rows are returned correctly
        if (!Array.isArray(rows)) {
            return res.status(500).json({ error: "Database returned invalid data." });
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: "No posts found for this user." });
        }

        // Send the rows (posts) as the response
        res.status(200).json(rows);  // Send only the rows (posts)
    } catch (err) {
        console.error("Error fetching posts:", err);  // Log the error for debugging
        res.status(500).json({ error: "Failed to fetch posts.", details: err.message });
    }
};

exports.getCommentsForPost = async (req, res) => {
    const { post_id } = req.query;  // Fetch the post_id from query parameters

    if (!post_id) {
        return res.status(400).json({ error: "Post ID is required." });
    }

    try {
        // Query for comments related to the given post_id
        const [comments] = await db.promise().query(
            "SELECT * FROM Comment WHERE post_id = ? ORDER BY created_at ASC", 
            [post_id]
        );

        if (comments.length === 0) {
            return res.status(404).json({ message: "No comments found for this post." });
        }

        res.status(200).json(comments);  // Return the comments as JSON
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({ error: "Failed to fetch comments.", details: err.message });
    }
};