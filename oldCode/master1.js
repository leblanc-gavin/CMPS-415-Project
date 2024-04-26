// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const User = require('./user');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect('mongodb+srv://bradford:bradford@cluster0.cpmkg9v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Default route - Serve login/register form
app.get('/', async (req, res) => {
    const userID = req.cookies.userID;

    if (userID) {
        res.redirect('/user-info');

    }
    else {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login/Register</title>
            <!-- Include Bootstrap CSS directly from CDN -->
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mt-5">
                <h1>Welcome</h1>
                <h2>Login or Register</h2>
                <form action="/" method="post">
                    <div class="form-group">
                        <input type="text" class="form-control" name="userID" placeholder="Enter username" required>
                    </div>
                    <div class="form-group">
                        <input type="password" class="form-control" name="password" placeholder="Enter password" required>
                    </div>
                    <button type="submit" class="btn btn-primary" name="action" value="login">Login</button>
                    <button type="submit" class="btn btn-secondary" name="action" value="register">Register</button>
                </form>
            </div>
        </body>
        </html>
    `);
    }
});

// Login/Register route
app.post('/', async (req, res) => {
    const { userID, password, action } = req.body;

    try {
        if (action === 'login') {
            const user = await User.findOne({ userID, password });

            if (!user) {
                return res.send(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Invalid Username or Password</title>
                        <!-- Include Bootstrap CSS directly from CDN -->
                        <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                    </head>
                    <body>
                        <div class="container mt-5">
                            <p>Invalid username or password</p>
                            <button type="button" class="btn btn-primary" onclick="window.location.href='/'">Go Back</button>
                        </div>
                    </body>
                    </html>
                `);
            }

            // Set cookie with userID
            res.cookie('userID', userID, { maxAge: 60000 });            
            res.redirect('/user-info');

        } else if (action === 'register') {
            // Check if the user already exists
            const existingUser = await User.findOne({ userID });

            if (existingUser) {
                return res.send(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Username Already Exists</title>
                        <!-- Include Bootstrap CSS directly from CDN -->
                        <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                    </head>
                    <body>
                        <div class="container mt-5">
                            <p>Username already exists</p>
                            <button type="button" class="btn btn-primary" onclick="window.location.href='/'">Go Back</button>
                        </div>
                    </body>
                    </html>
                `);
            }

            // Create a new user
            const newUser = new User({ userID, password });
            await newUser.save();

            // Set cookie with userID
            res.cookie('userID', userID);
            res.redirect('/user-info');

        } else if (action === 'deleteCookie') {
            // Clear the cookie
            res.clearCookie('userID');
            return res.redirect('/');

        } else {
            res.status(400).send('Invalid action');
        }

    } catch (error) {
        console.error('Error during login/register:', error);
        res.status(500).send('Internal Server Error');
    }
});

// User info route
app.get('/user-info', async (req, res) => {
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
                <form action="/" method="post">
                    <button type="submit" class="btn btn-secondary" name="action" value="deleteCookie">Delete Cookie</button>
                </form><br>
                <form action="/cookie-reporting" method="get">
                    <button type="submit" class="btn btn-info">Cookie Reporting</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// Logout route
app.post('/logout', async (req, res) => {
    // Clear the cookie
    res.clearCookie('userID');
    
    // Redirect to the login page
    res.redirect('/');
});

// Cookie clearing route
app.post('/clear-cookie', (req, res) => {
    // Clear the cookie
    res.clearCookie('userID');

    // Render a page indicating that the cookie has been cleared
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cookie Cleared</title>
            <!-- Include Bootstrap CSS directly from CDN -->
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mt-5">
                <h1>Cookie Cleared</h1>
                <p>The cookie has been cleared successfully.</p>
                <button type="button" class="btn btn-primary" onclick="window.location.href='/cookie-reporting'">Login</button>
            </div>
        </body>
        </html>
    `);
});

app.get('/cookie-reporting', (req, res) => {
    // Retrieve userID from cookie
    const userID = req.cookies.userID;

    // Check if userID exists
    if (!userID) {
        // If userID doesn't exist, redirect to login page
        return res.redirect('/');
    }

    // Display currently set cookie
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cookie Reporting</title>
            <!-- Include Bootstrap CSS directly from CDN -->
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mt-5">
                <h1>Cookie Reporting</h1>
                <p>Currently set cookie: ${userID}</p>
                <form action="/clear-cookie" method="post">
                    <button type="submit" class="btn btn-danger">Clear Cookie</button>
                </form><br>
                <button type="button" class="btn btn-primary" onclick="window.location.href='/user-info'">Back to User Info</button>
            </div>
        </body>
        </html>
    `);
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});