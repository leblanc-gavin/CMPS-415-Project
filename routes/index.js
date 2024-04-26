const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Default route - Serve login/register form
router.get('/', (req, res) => {
    const userID = req.cookies.userID;

    if (userID) {
        res.redirect('/user-info');
    } else {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Login/Register</title>
                <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">

                <script>
                    function setFormAction(actionUrl) {
                        document.getElementById("userForm").action = actionUrl;
                    }
                </script>

            </head>
            <body>
                <div class="container mt-5">
                    <h1>Welcome</h1>
                    <h2>Login or Register</h2>
                        <form id="userForm" method="post">
                        <div class="form-group">
                            <input type="text" class="form-control" name="userID" placeholder="Enter username" required>
                        </div>
                        <div class="form-group">
                            <input type="password" class="form-control" name="password" placeholder="Enter password" required>
                        </div>
                        <button type="submit" onclick="setFormAction('/auth/login')" class="btn btn-primary">Login</button>
                        <button type="submit" onclick="setFormAction('/auth/register')" class="btn btn-secondary">Register</button>
                    </form>
                </div>
            </body>
            </html>
        `);
    }
});

module.exports = router;
