const bcrypt = require("bcrypt");
const db = require('../db');

exports.registerUser = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    //Hash the password
    const hashedPass = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO User (firstname, lastname, email, hashedpass) VALUES (?, ?, ?, ?)`;
    db.query(sql, [firstname, lastname, email, hashedPass], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Could not register user" });
        }
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