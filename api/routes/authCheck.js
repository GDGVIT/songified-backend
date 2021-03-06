
const authCheck = (req, res, next) => {
  if (!req.user) {
    res.status(400).json({
      message: 'Unauthorized Access. user not logged in'
    })
  } else {
    next()
  }
}

module.exports = authCheck
