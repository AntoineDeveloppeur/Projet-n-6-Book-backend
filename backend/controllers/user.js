const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.signup = (req, res, next) => {
    bcrypt
        .hash(req.body.password, 10)
        .then((hash) => {
            const userbook = new User({
                email: req.body.email,
                password: hash,
            })
            userbook
                .save()
                .then(() =>
                    res.status(201).json({ message: 'utilisateur enregistré' })
                )
                .catch((error) => {
                    res.status(408).json({ error })
                })
        })
        .catch((error) => {
            res.status(503).json({ error })
        })
}

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (user === null) {
                res.status(401).json({
                    message: 'utilisateur inconnu',
                })
            } else {
                bcrypt
                    .compare(req.body.password, user.password)
                    .then((valid) => {
                        if (!valid) {
                            res.status(401).json({
                                message: 'mot de pass incorect',
                            })
                        } else {
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    process.env.SECRETPHRASEFORTOKEN, // C'est la clé secrète qui permet de générer le token
                                    { expiresIn: '48h' }
                                ),
                            })
                        }
                    })
                    .catch((error) => {
                        res.status(500).json({ error })
                    })
            }
        })
        .catch((error) => {
            res.status(500).json({ error })
        })
}
