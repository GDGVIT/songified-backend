const mongoose = require('mongoose')
const Schema = mongoose.Schema

const songInfoSchema = new Schema({
  user: {
    type: Object,
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
  songName: {
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
