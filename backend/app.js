const express = require('express')
const userRoutes = require('./routes/User')
const bookRoutes = require('./routes/Book')
const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config()

const app = express()

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    )
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    )
    next()
})

app.use(express.json())

mongoose
    .connect(
        `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.fndalaw.mongodb.net/?retryWrites=true&w=majority&appName=${process.env.APPNAME}`
    )
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'))

// La ligne ci-dessous permet aux images d'être accessible publiquement. C'est-à-dire qu'avec l'URL de l'image donné aux front-end, celui-ci peut la charger
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use('/api/books', bookRoutes)
app.use('/api/auth', userRoutes)

module.exports = app
