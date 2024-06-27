const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb')
const user = require('./routes/User')
const userRoutes = require('./routes/User')
const bookRoutes = require('./routes/Book')
const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config()

const app = express()

// // CORS configuration
// const corsOptions = {
//     origin: '*', // Adjust this to match your frontend's origin
//     methods: 'GET,POST,PUT,DELETE,OPTIONS',
//     allowedHeaders: 'Content-Type, Authorization',
// }

// app.use(cors(corsOptions))

// // Handle preflight OPTIONS request
// app.options('*', cors(corsOptions))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
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
        // 'mongodb+srv://antoineverove:TPKIpIN61zJvWmp5@antoineserver.fndalaw.mongodb.net/?retryWrites=true&w=majority&appName=Antoineserver',
        `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.fndalaw.mongodb.net/?retryWrites=true&w=majority&appName=${process.env.APPNAME}`
    )
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'))

module.exports = app

/*
 *
 * fin configuration de connection à la base de donnée
 *
 */

// Cela indique à Express qu'il faut gérer la ressource images de manière statique
app.use('/images', express.static(path.join(__dirname, 'images')))

// Il faut ajouter la requête nécessaire pour montrer les livres
app.use('/api/books', bookRoutes)

app.use('/api/auth', userRoutes)
