const mongoose = require('mongoose')
const Schema = mongoose.Schema

const songbookSchema = new Schema({
  songbookId: {
    type: String,
    required: true
  },
  data: {
    type: Array,
    default: []
  }
})

const Songbook = mongoose.model('songbook', songbookSchema)

module.exports = Songbook
