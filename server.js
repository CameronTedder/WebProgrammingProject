const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./db');
const userRoutes = require('./routes/users');
// const postRoutes = require('./routes/posts');

require('dotenv').config(); //Local environment variables

//Middleware
app.use(bodyParser.urlencoded({ extended: true })); // To handle form submissions
app.use(bodyParser.json()); // To handle JSON requests
app.use(express.static('public')); // Serve static HTML, CSS, and JS


//Routes
app.use('/api/users', userRoutes);
// app.use('/api/posts', postRoutes);

//Test Route
app.get('/', (req, res) => {
    res.send("Welcome to the API!");
});

//Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
    console.log("Server running on http://localhost:${PORT}");
});


