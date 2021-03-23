const router = require('express').Router()

router.get('/', (req, res) => {
  res.json('GET ACCESSED OF UPLOAD')
})

router.post('/cyaniteWebHook', (req, res) => {
  console.log(req)
  res.json({
    'Test Accessed': 'Accessed'
  })
})

module.exports = router
