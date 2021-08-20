const jwt = require('jsonwebtoken');

const User = require('../models/user');

module.exports = (req, res, next) =>{
    const token = req.get('Authorization').split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'somesupersecretsecret');
    } catch (err){
        err.statusCode = 500;
        throw err;
    }
    if(!decodedToken){
        const error = new Error('Token Expired !');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    next();
};