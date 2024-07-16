const Books = require('../models/book')
const fs = require('fs')

exports.getAllBooks = (req, res, next) => {
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
    const bookObject = JSON.parse(req.body.book)
    delete bookObject.userId

    const newBook = new Books({
        userId: req.auth.userId,
        title: bookObject.title,
        author: bookObject.author,
        // Grâce à l'utilisation de express.static je n'ai pas besoin de récupérer le protocole et le domaine pour ajouter l'image
        imageUrl: `${req.protocol}://${req.get('host')}/${req.file.path}`,
        // imageUrl: `/images/resized_${req.file.filename}`,

        year: bookObject.year,
        genre: bookObject.genre,
        ratings: [
            { userId: req.auth.userId, grade: bookObject.ratings[0].grade },
        ],
        averageRating: 0,
    })

    newBook
        .save()
        .then(() => {
            res.status(201).json({ message: 'livre enregistré' })
        })
        .catch((error) => {
            res.status(400).json({ error })
        })
}

exports.getBestRatings = (req, res, next) => {
    Books.find()
        .then((AllBooks) => {
            AllBooks.sort((a, b) => b.averageRating - a.averageRating)
            const ThreeBestBooks = [AllBooks[0], AllBooks[1], AllBooks[2]]
            res.status(201).json(ThreeBestBooks)
        })
        .catch((error) => {
            res.status(400).json({ error })
        })
}

exports.modifyABook = (req, res, next) => {
    const bookObject = req.file
        ? {
              ...JSON.parse(req.body.book),
              imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${
                  req.file.filename
              }`,
          }
        : { ...req.body }
    delete bookObject._userId
    Books.findOne({ _id: req.params.id })
        .then((book) => {
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
                        res.status(200).json({ message: 'book modifié' })
                    })
                    .catch((error) => res.status(400).json({ error }))
            }
        })
        .catch((error) => {
            res.status(401).json({ error })
        })
}

exports.deleteABook = (req, res, next) => {
    Books.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId === req.auth.userId) {
                const filename = book.imageUrl.split('/images')[1]
                fs.unlink(`images/resized_${filename}`, () => {
                    Books.deleteOne({ _id: req.params.id })
                        .then(() => {
                            res.status(201).json({
                                message: 'deletion effectuée',
                            })
                        })
                        .catch((error) => res.status(401).json({ error }))
                })
            } else {
                res.status(403).json({
                    message:
                        "vous n'êtes pas authorisé à supprimer ce livre car vous n'êtes pas celui qui l'a enregistré",
                })
            }
        })
        .catch((error) => res.status(500).json({ error }))
}

exports.rateABook = (req, res, next) => {
    Books.findOne({ _id: req.params.id })
        .then((bookObject) => {
            const userAlreadyRateThisBook = bookObject.ratings.find(
                (rating) => rating.userId === req.auth.userId
            )
            if (userAlreadyRateThisBook) {
                res.status(403).json({
                    message: "l'utilisateur à déjà noté le livre",
                })
            } else {
                // ici il faut ajouter un objet avec le rating de l'utilisateur
                bookObject.ratings.push({
                    userId: req.auth.userId,
                    grade: req.body.rating,
                })
                Books.updateOne(
                    { _id: req.params.id },
                    { $set: { ratings: bookObject.ratings } }
                )
                    .then(() => {
                        Books.findOne({ _id: req.params.id })
                            .then((book) => {
                                const averageRating =
                                    book.ratings.reduce((sum, rating) => {
                                        return sum + rating.grade
                                    }, 0) / book.ratings.length
                                console.log('averageRating', averageRating)
                                Books.updateOne(
                                    { _id: req.params.id },
                                    { $set: { averageRating: averageRating } }
                                )
                                    .then(() => {
                                        Books.findOne({ _id: req.params.id })
                                            .then((book) =>
                                                res.status(200).json(book)
                                            )
                                            .catch((error) =>
                                                res.status(400).json({ error })
                                            )
                                    })
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
            res.status(404).json({ error })
        })
}
