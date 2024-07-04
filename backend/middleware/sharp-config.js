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
