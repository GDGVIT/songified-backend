const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  googleId: {
    type: String,
    required: true
  },
  points: {
    type: Number
  }
})

const User = mongoose.model('user', userSchema)

module.exports = User
