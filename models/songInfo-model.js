const mongoose = require('mongoose')
const Schema = mongoose.Schema

const songInfoSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  songId: {
    type: String,
    required: true
  },
  detail: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  }
})

const SongInfo = mongoose.model('songinfo', songInfoSchema)

module.exports = SongInfo
