const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator/check');

const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Please enter valid User properties');
        error.statusCode = 422;
        error.data = error.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password, 12)
        .then(hashedPw => {
            const user = new User({
                email: email,
                password: hashedPw,
                name: name
            });
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'User Created!',
                userId: result._id
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    let loadedUser;
    User
        .findOne({ email: email })
        .then(user => {
            if (!user) {
                const error = new Error('Please enter valid User Details !');
                error.statusCode = 401;
                // error.data = error.array();
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Please enter valid Password !');
                error.statusCode = 401;
                // error.data = error.array();
                throw error;
            }
            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser._id.toString()
                },
                'somesupersecretsecret',
                { expiresIn: '1h' }
            );
            res.status(200).json({
                token: token,
                userId: loadedUser._id.toString() 
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getStatus = (req,res, next) => {
    User
        .findById(req.userId)
        .then(user =>{
            if(!user){
                const error = new Error('Not a Valid User !');
                error.statusCode = 404;
                // error.data = error.array();
                throw error;
            }
            res.status(200).json({
                status: user.status
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.updateStatus = (req,res, next) => {
    const newStatus = req.body.status;
    User
        .findById(req.userId)
        .then(user =>{
            if(!user){
                const error = new Error('Not a Valid User !');
                error.statusCode = 404;
                // error.data = error.array();
                throw error;
            }
            user.status = newStatus;
            return user.save();
        })
        .then(result => {
            res.status(200).json({
                message: "Your status is updated !"
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

