const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  points: {
    type: Number
  },
  songbookId: {
    type: String
  },
  email: {
    type: String,
    required: true
  }
})

const User = mongoose.model('user', userSchema)

module.exports = User
