const express = require('express')
const bookCtrl = require('../controllers/book')
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')
const router = express.Router()

router.get('/', bookCtrl.getAllBooks)
router.post('/:id/rating', auth, bookCtrl.rateABook)
router.get('/:id', bookCtrl.getABook)
router.get('/bestrating', bookCtrl.getBestRatings)
router.post('/', auth, multer, bookCtrl.postABook)
router.put('/:id', auth, multer, bookCtrl.modifyABook)
router.delete('/:id', auth, bookCtrl.deleteABook)

module.exports = router
