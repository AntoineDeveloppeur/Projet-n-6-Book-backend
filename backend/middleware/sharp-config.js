const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const compressFile = async (req, res, next) => {
    try {
        const { filename, path: filePath } = req.file
        const newFilePath = path.join('images', `resized_${filename}`)

        console.log('newfilepath', newFilePath)
        console.log('req.file.filename', req.file.filename)
        console.log(
            'lien complet',
            `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        )
        // await sharp(`/images/${req.file.filename}`)
        // .webp({ quality: 20 })
        // .toFile(`/images/compressed${req.file.filename}`)
        sharp(filePath)
            .resize({ width: 206, fit: sharp.fit.contain })
            .toFile(newFilePath)
            .then(() => {
                fs.unlink(filePath, (error) => {
                    req.file.path = newFilePath
                    next()
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
}

module.exports = compressFile
