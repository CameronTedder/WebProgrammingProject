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

        res.status(200).json({ message: "Login successful", user });
    });
};