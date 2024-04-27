const express = require('express');
const router = express.Router();

// Route to display the DevTools page
router.get('/', (req, res) => {
    res.render('devtools', { 
        title: "Development Tools",
        cookie: req.cookies.userToken || 'No cookie set'

    }); // You can pass any necessary data to the EJS template here
});

module.exports = router;
