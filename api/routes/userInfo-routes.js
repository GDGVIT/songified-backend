const router = require('express').Router()
const authCheck = require('./authCheck')

router.get('/', authCheck, (req, res) => {
  const data = {
    name: req.user.username,
    pic: req.user.thumbnail,
    songbookId: req.user.songbookId
  }
  res.status(200).json(data)
})

module.exports = router
