const jwt = require('jsonwebtoken');
const { User } = require('../models');
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log(req.headers, token);
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findByPk(decoded.userId);
            req.user = user;
        } catch (error) {
            console.error('Error verifying token:', error);
        }
    }

    next();
};