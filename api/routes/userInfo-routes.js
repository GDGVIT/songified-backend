const router = require('express').Router()
const authCheck = require('./authCheck')

router.get('/', authCheck, (req, res) => {
  res.status(200).json(req.user)
})

module.exports = router
