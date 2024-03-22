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
        <h1>Welcome</h1>
        <h2>Login or Register</h2>
        <form action="/" method="post">
            <input type="text" name="userID" placeholder="Enter username" required><br>
            <input type="password" name="password" placeholder="Enter password" required><br>
            <button type="submit" name="action" value="login">Login</button>
            <button type="submit" name="action" value="register">Register</button>
        </form>
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
                    <p>Invalid username or password</p>
                    <button type="button" onclick="window.location.href='/'">Go Back</button>
                `);
            }

            // Set cookie with userID
            res.cookie('userID', userID);
            res.redirect('/user-info');
        } else if (action === 'register') {
            // Check if the user already exists
            const existingUser = await User.findOne({ userID });

            if (existingUser) {
                return res.send(`
                    <p>Username already exists</p>
                    <button type="button" onclick="window.location.href='/'">Go Back</button>
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
        <h1>Welcome ${userID}</h1>
        <p>Cookie set with userID: ${userID}</p>
        <form action="/logout" method="post">
            <button type="submit">Logout</button>
        </form>
        <form action="/" method="post">
            <button type="submit" name="action" value="deleteCookie">Delete Cookie</button>
        </form>
    `);
});

// Logout route
app.post('/logout', async (req, res) => {
    // Clear the cookie
    res.clearCookie('userID');
    
    // Redirect to the login page
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});