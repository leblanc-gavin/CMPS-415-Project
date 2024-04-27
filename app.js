const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const topicRoutes = require('./routes/topics');

const app = express();
app.set('view engine', 'ejs');

require('dotenv').config(); // Ensuring dotenv is configured as early as possible

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to the database
connectDB();

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/user-info', require('./routes/userInfo'));
app.use('/topics', topicRoutes);
app.use('/devtools', require('./routes/devtools'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
