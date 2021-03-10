const router = require('express').Router()
const passport = require('passport')

router.get('/logout', (req, res) => {
  req.logout()
  res.status(200).json({
    message: 'logout successful'
  })
})

router.get('/google', passport.authenticate('google', {
  scope: ['profile']
}))

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  res.status(200).json({
    message: 'login succesful, cookie created',
    data: {
      name: req.user.username,
      points: req.user.points
    }
  })
})

module.exports = router
