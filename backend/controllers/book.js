const Books = require('../models/book')
const fs = require('fs')

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

    const newBook = new Books({
        userId: req.auth.userId,
        title: bookObject.title,
        author: bookObject.author,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
            req.file.filename
        }`,
        year: bookObject.year,
        genre: bookObject.genre,
        ratings: [{ userId: req.auth.userId, grade: bookObject.ratings.grade }], // La notation est laissé vide, à voir comment la base de donnée accepte les propriétés vide
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

exports.getBestRatings = (req, res, next) => {}

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
            res.status(200).json({ message: 'tout est cool' })
            console.log('bookObject.ratings', bookObject.ratings)
            const userRateAlreadyThisBook = bookObject.ratings.find(
                (rating) => rating.userId === req.auth.userId
            )
            if (userRateAlreadyThisBook) {
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
                    rating: req.body.rating,
                })
                console.log('bookObject.ratings', bookObject.ratings)
                console.log('bookObject', bookObject)
            }

            //     const newBookObjectRatings = bookObject.ratings.map(
            //         (rating) => rating
            //     )
            //     console.log('newBookObjectRatings', newBookObjectRatings)
            // }

            // } else {
            //     console.log('bokkObject.ratin', bookObject.rating)
            //     const newBookRatingObject = bookObject.rating
            //     newBookRatingObject.push(req.body)
            //     Books.updateOne(
            //         { _id: req.params.id },
            //         { $set: { rating: newBookRatingObject } }
            //     )
            //         .then(() => {
            //             res.status(200)
            //             Books.findOne({ _id: req.params.id }).then(
            //                 (bookObject) => {
            //                     bookObject
            //                 }
            //             )
            //         })
            //         .catch((error) => res.status(400).json({ error }))
            // }
        })
        .catch((error) => {
            console.log('Livre non trouvé')
            res.status(404).json({ error })
        })
}
