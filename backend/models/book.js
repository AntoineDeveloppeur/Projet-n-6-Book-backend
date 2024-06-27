const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const bookSchema = mongoose.Schema({
    userId: { type: String, required: true }, //- identifiant MongoDB unique de l'utilisateur qui a créé le livre
    title: { type: String, required: true, unique: true }, //- titre du livre
    author: { type: String, required: true }, //- auteur du livre
    imageUrl: { type: String, required: true }, // - illustration/couverture du livre
    year: { type: Number, required: true }, // - année de publication du livregenre: String - genre du livre
    genre: { type: String, required: true },
    ratings: [
        {
            userId: { type: String, required: false }, // - identifiant MongoDB unique de l'utilisateur qui a noté le livre
            grade: { type: Number, required: false }, //- note donnée à un livre
        },
    ], //- notes données à un livre
    averageRating: { type: Number, required: true }, // - note moyenne du livre
})

bookSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Book', bookSchema)
