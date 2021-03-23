const router = require('express').Router()
const authCheck = require('./authCheck')

router.get('/', authCheck, (req, res) => {
  res.json('GET ACCESSED OF UPLOAD')
})

router.post('/cyaniteWebHook', (req, res) => {
  console.log(req)
})

module.exports = router
