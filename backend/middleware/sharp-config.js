const sharp = require('sharp')
const fs = require('fs')

const compressFile = async (req, res, next) => {
    if (req.file) {
        try {
            const { filename, path: filePath } = req.file
            const resizedPath = `images/resized_${filename}`
            const compressedPath = `images/compressed_${filename}`
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
