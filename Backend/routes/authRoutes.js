const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();


router.post('/signup', [
    
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('firstName').notEmpty().withMessage('First name is required')
], (req, res) => {
    
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    res.send("User Validated and Created");
});

module.exports = router;