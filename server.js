const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const db = require('./db');
const routes = require('./routes/routes');
require('dotenv').config(); //Local environment variables

//Middleware
app.use(bodyParser.urlencoded({ extended: true })); // To handle form submissions
app.use(bodyParser.json()); // To handle JSON requests
app.use(express.static('public')); // Serve static HTML, CSS, and JS

app.use(session({
    secret: process.env.SESSION_SECRET, // Load from environment variable
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to `true` if using HTTPS
}));

//Routes
app.use('/api/routes', routes);


//Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
    console.log("Server running on http://localhost:${PORT}");
});


