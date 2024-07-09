const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const compressFile = async (req, res, next) => {
    if (req.file) {
        try {
            const { filename, path: filePath } = req.file
            const resizedPath = `images/resized_${filename}`
            const compressedPath = `images/compressed_${filename}`
            console.log('resizedPath', resizedPath)
            console.log('req.file.filename', req.file.filename)
            console.log(
                'lien complet',
                `${req.protocol}://${req.get('host')}/images/${
                    req.file.filename
                }`
            )
            // Le premier sharp redimenssionne l'image
            sharp.cache(false)
            sharp(filePath)
                .resize({ width: 206, fit: sharp.fit.contain })
                .toFile(resizedPath)
                .then(() => {
                    fs.unlink(filePath, (error) => {
                        // La deuxième sharp compresse l'image
                        sharp(resizedPath)
                            .webp({ quality: 30 })
                            .toFile(compressedPath)
                            .then(() => {
                                fs.unlink(resizedPath, (error) => {
                                    req.file.path = compressedPath
                                    console.log(
                                        'req.file.path après compression',
                                        req.file.path
                                    )
                                    console.log(
                                        'compressedpath',
                                        compressedPath
                                    )
                                    next()
                                })
                            })
                            .catch((err) => {
                                console.log(err)
                                return next()
                            })
                    })
                })
                .catch((err) => {
                    console.log(err)
                    return next()
                })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ error: 'Internal Server Error' })
        }
    } else {
        next()
    }
}

module.exports = compressFile

// const sharp = require('sharp')
// const path = require('path')
// const fs = require('fs').promises

// const checkPermissions = async (filePath) => {
//     try {
//         await fs.access(filePath, fs.constants.R_OK | fs.constants.W_OK)
//         console.log(`${filePath} est accessible en lecture et écriture`)
//         return true
//     } catch (err) {
//         console.error(
//             `${filePath} n'est pas accessible en lecture et écriture`,
//             err
//         )
//         return false
//     }
// }

const filePath = `C:\\Users\\PC\\Documents\\Mon ordinateur2\\Travail\\Reconversion\\Dossier Echange Antoine OpenClassRoom\\Projet n°6 Notation de livre\\codebase - Copie\\backend\\images\\resized_9pique.jpg1720078837968.jpeg`

// const compressFile = async (req, res, next) => {
//     console.log('checkPermissions(filePath)', checkPermissions(filePath))
//     console.log(filePath)
//     if (req.file) {
//         try {
//             const { filename, path: filePath } = req.file
//             const resizedPath = `images/resized_${filename}`
//             const compressedPath = `images/compressed_${filename}`

//             console.log('resizedPath', resizedPath)
//             console.log('req.file.filename', req.file.filename)
//             console.log(
//                 'lien complet',
//                 `${req.protocol}://${req.get('host')}/images/${
//                     req.file.filename
//                 }`
//             )

//             // Redimensionne l'image
//             await sharp(filePath)
//                 .resize({ width: 206, fit: sharp.fit.contain })
//                 .toFile(resizedPath)

//             // Supprime le fichier original
//             await fs.unlink(filePath)

//             // Compresse l'image redimensionnée
//             await sharp(resizedPath)
//                 .webp({ quality: 30 })
//                 .toFile(compressedPath)

//             // Supprime l'image redimensionnée
//             await fs.unlink(resizedPath)

//             // Met à jour le chemin du fichier compressé dans req.file.path
//             req.file.path = compressedPath
//             console.log('req.file.path après compression', req.file.path)
//             console.log('compressedpath', compressedPath)

//             next()
//         } catch (error) {
//             console.error("Erreur lors du traitement de l'image:", error)
//             return res.status(500).json({ error: 'Internal Server Error' })
//         }
//     } else {
//         next()
//     }
// }

// module.exports = compressFile
