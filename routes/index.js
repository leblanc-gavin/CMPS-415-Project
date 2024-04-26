const express = require('express');
const router = express.Router();

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
            </head>
            <body>
                <div class="container mt-5">
                    <h1>Welcome</h1>
                    <h2>Login or Register</h2>
                    <form action="/auth/login" method="post">
                        <div class="form-group">
                            <input type="text" class="form-control" name="userID" placeholder="Enter username" required>
                        </div>
                        <div class="form-group">
                            <input type="password" class="form-control" name="password" placeholder="Enter password" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Login</button>
                    </form>
                    <form action="/auth/register" method="post">
                        <button type="submit" class="btn btn-secondary">Register</button>
                    </form>
                </div>
            </body>
            </html>
        `);
    }
});

module.exports = router;
