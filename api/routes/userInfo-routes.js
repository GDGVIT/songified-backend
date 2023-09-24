const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const User = require('../../models/user-model')

router.get('/', verifyToken, (req, res) => {
  User.findOne({ email: req.user.email })
    .then((user) => {
      res.status(200).json(user)
    })
    .catch((err) => {
      res.status(400).json(err)
    })
})

module.exports = router
