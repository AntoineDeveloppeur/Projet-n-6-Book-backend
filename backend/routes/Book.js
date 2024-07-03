const express = require('express')
const bookCtrl = require('../controllers/book')
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')
const router = express.Router()
const compressFile = require('../middleware/sharp-config')

router.get('/bestrating', bookCtrl.getBestRatings)
router.post('/:id/rating', auth, bookCtrl.rateABook)
router.get('/:id', bookCtrl.getABook)
router.get('/', bookCtrl.getAllBooks)
router.post('/', auth, multer, compressFile, bookCtrl.postABook)
router.put('/:id', auth, multer, compressFile, bookCtrl.modifyABook)
router.delete('/:id', auth, bookCtrl.deleteABook)

module.exports = router
