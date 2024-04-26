const express = require('express');
const router = express.Router();
const User = require('../models/user');  // Make sure the path matches your user model

// User info route
router.get('/', async (req, res) => {
    // Retrieve userID from cookie
    const userID = req.cookies.userID;

    // Check if userID exists
    if (!userID) {
        // If userID doesn't exist, redirect to login page
        return res.redirect('/');
    }
    
    // Display user info
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Info</title>
            <!-- Include Bootstrap CSS directly from CDN -->
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mt-5">
                <h1>Welcome ${userID}</h1>
                <p>Cookie set with userID: ${userID}</p>
                <form action="/logout" method="post">
                    <button type="submit" class="btn btn-primary">Logout</button>
                </form><br>
                <!-- <form action="/" method="post">
                    <button type="submit" class="btn btn-secondary" name="action" value="deleteCookie">Delete Cookie</button>
                </form><br>
                <form action="/cookie-reporting" method="get">
                    <button type="submit" class="btn btn-info">Cookie Reporting</button>
                </form> -->
            </div>
        </body>
        </html>
    `);
});

module.exports = router;
