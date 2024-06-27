const jwt = require('jsonwebtoken')

// Si le token n'est pas bon, la requête s'arrête là. Du coup la fonction suivante comme rateABook n'est pas faîte. Pas besoin de vérifier à chaque fonction si l'utilisateur est connecté
module.exports = (req, res, next) => {
    console.log('Avant authentification : req.originalUrl', req.originalUrl)

    try {
        const token = req.headers.authorization.split(' ')[1]
        const decodedToken = jwt.verify(token, 'Rmni%355bX3tPNUV*e(E')
        req.auth = { userId: decodedToken.userId }
        console.log('début de auth req.params.id', req.params.id)

        next()
    } catch (error) {
        console.log('erreur dans le auth.js')
        res.status(401).json({ error })
    }
}
