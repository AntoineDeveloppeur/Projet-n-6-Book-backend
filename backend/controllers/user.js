const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

exports.signup = (req, res, next) => {
    console.log('je suis dans signup', req.body.password)
    bcrypt
        .hash(req.body.password, 1)
        .then((hash) => {
            console.log(hash)
            const userbook = new User({
                email: req.body.email,
                password: hash,
            })
            console.log(userbook)
            userbook
                .save()
                .then(() =>
                    res.status(201).json({ message: 'utilisateur enregistré' })
                )
                .catch((error) => {
                    console.log('error dans le save')
                    res.status(408).json({ error })
                })
        })
        .catch((error) => {
            console.log('erreur dans le catch de hash')
            res.status(503).json({ error })
        })
}

exports.login = (req, res, next) => {
    console.log('je suis dans la fonction login')
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (user === null) {
                console.log('utilisateur inconnu')
                res.status(401).json({
                    message: 'utilisateur inconnu',
                })
            } else {
                bcrypt
                    .compare(req.body.password, user.password)
                    .then((valid) => {
                        if (!valid) {
                            console.log(
                                'mot de pass incorect user password',
                                user.password,
                                'req.body.password',
                                req.body.password
                            )
                            res.status(401).json({
                                message: 'mot de pass incorect',
                            })
                        } else {
                            console.log({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    'Rmni%355bX3tPNUV*e(E', // C'est la clé secrète qui permet de générer le token
                                    { expiresIn: '24h' }
                                ),
                            })
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    'Rmni%355bX3tPNUV*e(E', // C'est la clé secrète qui permet de générer le token
                                    { expiresIn: '24h' }
                                ),
                            })
                        }
                    })
                    .catch((error) => {
                        console.log('error dans bcrypt du login')
                        res.status(500).json({ error })
                    })
            }
        })
        .catch((error) => {
            console.log('je suis dans le catch de findOne')
            res.status(500).json({ error })
        })
}
