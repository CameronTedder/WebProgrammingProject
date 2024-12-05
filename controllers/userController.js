const bcrypt = require("bcrypt");
const db = require('../db');

exports.registerUser = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    // Hash the password
    const hashedPass = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO User (firstname, lastname, email, hashedpass) VALUES (?, ?, ?, ?)`;
    db.query(sql, [firstname, lastname, email, hashedPass], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Could not register user" });
        }

        // Set the session after registration
        const userId = result.insertId; // Get the user_id of the newly created user
        req.session.user_id = userId; // Set the session user_id

        res.status(201).json({ message: "User registered successfully" });
    });
};

exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM User WHERE email = ?`;
    db.query(sql, [email], async (err, rows) => {
        if (err || rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.hashedpass);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        req.session.user_id = user.user_id;

        res.status(200).json({ 
            message: "Login successful", 
            user: user.user_id, email:user.email });
    });
};

exports.getCurrentUser = (req, res) => {
    if (req.session && req.session.user_id) {
        res.json({ user_id: req.session.user_id });
    } else {
        res.status(401).json({ error: "User not authenticated." });
    }
};

exports.getUserName = async (req, res) => {
    const { user_id } = req.query;  // Get user_id from the query parameters

    if (!user_id) {
        return res.status(400).json({ error: "User ID is required." });
    }

    try {
        // Fetch the first name from the User table using user_id
        const [user] = await db.promise().query("SELECT firstname FROM User WHERE user_id = ?", [user_id]);

        if (user.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        console.log("User data fetched:", user);  // Log the fetched user data to the console
        res.status(200).json({ firstname: user[0].firstname });  // Return the first name
    } catch (err) {
        console.error("Error fetching first name:", err);
        res.status(500).json({ error: "Failed to fetch first name.", details: err.message });
    }
};

exports.signout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to log out." });
        }
        res.status(200).json({ message: "Logged out successfully." });
    });
};

exports.checkAuth = (req, res) => {
    if (req.session.user_id) {
        return res.status(200).json({ message: "Authenticated" });
    }
    return res.status(401).json({ message: 'Not authenticated' });
};

exports.getUserProfile = (req, res) => {
    if (!req.session.user_id) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.session.user_id;

    const sql = `SELECT firstname, lastname, avatar_img FROM User WHERE user_id = ?`;
    db.query(sql, [userId], (err, rows) => {
        if (err || rows.length === 0) {
            return res.status(500).json({ error: "Failed to retrieve user data" });
        }
        const user = rows[0];
        res.status(200).json({ user });
    });
};

exports.updateUserProfile = (req, res) => {
    if (!req.session.user_id) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    const { firstname, lastname, avatar_img } = req.body;
    const userId = req.session.user_id;

    const sql = `UPDATE User SET firstname = ?, lastname = ?, avatar_img = ? WHERE user_id = ?`;
    db.query(sql, [firstname, lastname, avatar_img, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Failed to update profile" });
        }
        res.status(200).json({ message: "Profile updated successfully" });
    });
};

exports.getUserNotifications = (req, res) => {
    if (!req.session.user_id) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.session.user_id;
    const showRead = req.query.showRead === "true"; // Check if the query parameter is `true`

    // SQL to fetch notifications based on read status
    const sql = showRead
        ? "SELECT * FROM notifications WHERE user_id = ? AND is_read = TRUE ORDER BY created_at DESC"
        : "SELECT * FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC";

    db.query(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Failed to fetch notifications" });
        }
        res.status(200).json({ notifications: rows });
    });
};

exports.markNotificationAsRead = (req, res) => {
    if (!req.session.user_id) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    const notificationId = req.params.notificationId;

    const sql = "UPDATE notifications SET is_read = TRUE WHERE notification_id = ?";
    db.query(sql, [notificationId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Failed to mark notification as read" });
        }

        res.status(200).json({ message: "Notification marked as read" });
    });
};

exports.getUserDetails = (req, res) => {
    const userId = req.params.userId;
    const sql = "SELECT firstname, lastname FROM user WHERE user_id = ?";
    db.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error(err);  // Log error
            return res.status(500).json({ error: "Failed to fetch user details" });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(rows[0]);
    });
};

exports.getUserPosts = (req, res) => {
    const userId = req.params.userId;
    const sql = "SELECT post_text, created_at FROM post WHERE user_id = ? ORDER BY created_at DESC";
    db.query(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Failed to fetch user posts" });
        res.status(200).json(rows);
    });
};


exports.getUserProfileImage = async (req, res) => {
    const userId = req.session.user_id; // Assume user ID is stored in the session

    try {
        const [rows] = await db.promise().query(
            "SELECT avatar_img FROM User WHERE user_id = ?",
            [userId]
        );

        // If the user doesn't have an avatar image, return a default image
        const profileImage = rows[0]?.avatar_img || 'mm1.png';

        res.status(200).json({ profileImage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve profile image." });
    }
};