const Books = require('../models/book')
const fs = require('fs')
require('../functions/calculate_average_rating')

exports.getAllBooks = (req, res, next) => {
    console.log('lapplication reçoit la consigne de donner tous les bouquins')
    Books.find()
        .then((allBooks) => {
            res.status(200).json(allBooks)
        })
        .catch((error) => res.status(400).json({ error }))
}

exports.getABook = (req, res, next) => {
    Books.findOne({ _id: req.params.id })
        .then((book) => {
            res.status(200).json(book)
        })
        .catch((error) => res.status(400).json({ error }))
}

exports.postABook = (req, res, next) => {
    console.log('je suis dans la fonction postABook')
    console.log('req.body.book', req.body.book)
    const bookObject = JSON.parse(req.body.book)
    console.log('bookObject', bookObject)
    delete bookObject.userId
    console.log('req.body.title', bookObject.title)
    console.log('bookObject', bookObject)
    console.log('bookObject.ratings.grade', bookObject.ratings.grade)
    console.log('bookObject.ratings[0]', bookObject.ratings[0])
    console.log('bookObject.ratings[0].grade', bookObject.ratings[0].grade)

    const newBook = new Books({
        userId: req.auth.userId,
        title: bookObject.title,
        author: bookObject.author,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
            req.file.filename
        }`,
        year: bookObject.year,
        genre: bookObject.genre,
        ratings: [
            { userId: req.auth.userId, grade: bookObject.ratings[0].grade },
        ],
        averageRating: 0,
    })

    console.log('newbook', newBook)
    newBook
        .save()
        .then(() => {
            console.log('livre sauvegardé!')
            res.status(201).json({ message: 'livre enregistré' })
        })
        .catch((error) => {
            console.log('dans le catch de newBooksave')
            console.log(error)
            res.status(400).json({ error })
        })
}

exports.getBestRatings = (req, res, next) => {
    Books.find()
        .then((AllBooks) => {
            AllBooks.sort((a, b) => a.averageRating - b.averageRating)
            const ThreeBestBooks = [AllBooks[0], AllBooks[1], AllBooks[2]]
            console.log('AllBooks sorted', ThreeBestBooks)
            res.status(201).json({ message: ThreeBestBooks })
        })
        .catch((error) => res.status(400).json({ error }))
}

exports.modifyABook = (req, res, next) => {
    console.log('je suis dans la fonction modify a book')
    const bookObject = req.file
        ? {
              ...JSON.parse(req.body.book),
              imageUrl: `${req.protocol}://${req.get('host')}/images/${
                  req.file.filename
              }`,
          }
        : { ...req.body } //pourquoi a-t-on besoin du spread operator ici. Sous quel forme la requête arrive-t-elle sans fichier ?
    // On pourrait très bien mettre req.body tout court
    delete bookObject._userId
    console.log('bookObject', bookObject)
    Books.findOne({ _id: req.params.id })
        .then((book) => {
            console.log('je suis dans then de findOne')
            if (book.userId != req.auth.userId) {
                res.status(403).json({
                    message:
                        "utilisateur n'est pas autorisé à modifier le livre",
                })
            } else {
                Books.updateOne(
                    { _id: req.params.id },
                    { ...bookObject, _id: req.params._id }
                )
                    .then(() => {
                        console.log('je suis dans then de updateOne')

                        res.status(200).json({ message: 'book modifié' })
                    })
                    .catch((error) => res.status(400).json({ error }))
            }
        })
        .catch((error) => {
            console.log('je suis dans catch de findOne')

            res.status(401).json({ error })
        })
}

exports.deleteABook = (req, res, next) => {
    Books.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId === req.auth.userId) {
                const filename = book.imageUrl.split('/images')[1]
                fs.unlink(`images/${filename}`, () => {
                    Books.deleteOne({ _id: req.params.id })
                        .then(() => {
                            console.log('deletion effectué')
                            res.status(201).json({
                                message: 'deletion effectuée',
                            })
                        })
                        .catch((error) => res.status(401).json({ error }))
                })
            } else {
                console.log(
                    "vous n'êtes pas authorisé à supprimer ce livre car vous n'être pas celui qui l'a enregistré"
                )
                res.status(403).json({
                    message:
                        "vous n'êtes pas authorisé à supprimer ce livre car vous n'êtes pas celui qui l'a enregistré",
                })
            }
        })
        .catch((error) => res.status(500).json({ error }))
}

//En cours de construction
exports.rateABook = (req, res, next) => {
    console.log('req.params.id', req.params.id)
    console.log('req.body', req.body)
    Books.findOne({ _id: req.params.id })
        .then((bookObject) => {
            console.log('je suis rentré dans le then de findOne de rateaBook')
            console.log('bookObject.ratings', bookObject.ratings)
            const userAlreadyRateThisBook = bookObject.ratings.find(
                (rating) => rating.userId === req.auth.userId
            )
            console.log('userAlreadyRateThisBook', userAlreadyRateThisBook)
            if (userAlreadyRateThisBook) {
                console.log("l'utilisateur a déjà noté ce livre")
                res.status(403).json({
                    message: "l'utilisateur à déjà noté le livre",
                })
            } else {
                console.log('je peux continuer à développer pépaire')
                console.log('req.body.rating', req.body.rating)
                // ici il faut ajouter un objet avec le rating de l'utilisateur
                bookObject.ratings.push({
                    userId: req.auth.userId,
                    grade: req.body.rating,
                })
                console.log('bookObject.ratings', bookObject.ratings)
                console.log('bookObject', bookObject)
                Books.updateOne(
                    { _id: req.params.id },
                    { $set: { ratings: bookObject.ratings } }
                )
                    .then(() => {
                        console.log('Notation livre mis à jour')
                        Books.findOne({ _id: req.params.id })
                            .then((book) => {
                                console.log('book', book)
                                const averageRatingX =
                                    book.ratings.reduce(
                                        (sum, rating) => sum + rating.grade,
                                        0
                                    ) / book.ratings.length
                                console.log('averageRatingX', averageRatingX)
                                console.log('book.ratings', book.ratings)
                                Books.updateOne(
                                    { _id: req.params.id },
                                    { $set: { averageRating: averageRatingX } }
                                )
                                    .then(() =>
                                        res.status(200).json({
                                            message: 'Note moyenne mise à jour',
                                        })
                                    )
                                    .catch((error) => {
                                        res.status(400).json({ error })
                                    })
                            })
                            .catch((error) => {
                                res.status(404).json({ error })
                            })
                    })
                    .catch((error) => res.status(400).json({ error }))
            }
        })
        .catch((error) => {
            console.log('Livre non trouvé')
            res.status(404).json({ error })
        })
}
