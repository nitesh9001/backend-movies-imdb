const mongoose = require('mongoose');

const GenreModel = new mongoose.Schema({
    type: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
})

module.exports = mongoose.model('genres', GenreModel)