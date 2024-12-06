Project Description:
For my project I created a social media platform that allows users to sign up, log in, post content and interact with each other through comments and post.
Users can also play simple browsers games and see their highscores displayed on a leaderboard.

Features:
-User authentication and profiles
-Social feed with post and comments
-Game selection and high scores
-Leaderboard functionality
-Notifications for interactins and updates
-User profile management and settings

Tech Stack:
Server-side:
  -Node.js, Express.js, Express-session, bycrypt.js, MySQL2
Database:
  -MySQL
Front-End:
  -HTML, CSS, and Javascript
Development Tools:
  XXampp, Postman

How to run the project locally:
1.) Download and install XAMPP, open up the XAMPP control panel and start Apache and MySQL services
2.) Set up the MySQL Database with phpMyAdmin and import the SQL file with the table structures provided
3.) Set up the node.js by installing the proper npm packages
    -express: to handle routing and HTTP request
    -express-session: To manage user sessions
    -mysql2: To interact with the MySQL database
    -bycrypt: to hash and compare passwords securely
4.) Configure the Database connection by either editing the db.js file itself or by creating a .env with the following blueprint:
        DB_USER=replacewithusername
        DB_PASS=replacewithpass
        DB_NAME=replacewithdatabasename
        PORT=replacewithport
        SESSION_SECRET=replacewithyourchoosenpass
5.) Start the server by typing node server.js in the project directory
6.) Access the application by visiting http://localhost:3000 (or the port you are using) after all steps are completed

