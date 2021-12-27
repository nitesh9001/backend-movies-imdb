const mongoose = require('mongoose');

const MovieModel = new mongoose.Schema({
    posterurl: {
      data: String,
      contentType: String
    },
    title: {
      type: String,
      required: true,
      unique: true
    },
    desription: {
      type: String,
      required: true,
    },
    storyline: {
      type: String,
      required: true,
    },
    director: {
      type: String,
      required: true,
    },
    writer: {
      type: String,
      required: true,
    },
    stars: [{
      type: String
    }],
    language: [{
      type: String
    }],
    releaseDate: {
      type: String,
      required: true,
    },
    year:{
      type: String,
      required: true, 
    },
    duration: {
      type: String,
      required: true,
    },
    
    rating: {
      type: String,
      required: true,
    },
    genres: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "genres",
    }],
    status: {
      type: Boolean,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
    }
  },
  {
    timestamps: true,
})

module.exports = mongoose.model('movies', MovieModel)