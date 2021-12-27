const Genre = require("../../Models/genre");
var dotenv = require("dotenv").config();

exports.list = async (req, res, next) => {
    try {
    const genreList = await Genre.find();
    return res.status(200).json({ success: true, data: genreList });
  } catch (err) {
    return res.status(500).json({ success: false,  message: "Some internal error", error: err || null });
  }
};

exports.addGenre = async (req, res, next) => {
    
    const { type } = req.body;
    if(!type){
         return res.status(200).json({
            success: false,
            data: '',
            message: "Genres name is required"
          });
    }
    try{
       const genre = await new Genre({
        type: type,
        status: true,
      });

      genre.save()
      .then((data) => {
          return res.status(200).json({
            success: true,
            data: data,
            message: "Added sucessfully"
          });
        })
        .catch((err) => {
          if (err.code === 11000) {
            return res.status(200).json({
              success: false,
              message: "Validation error `type` should be unique",
            });
          } else {
            return res.status(200).json({ success: false, message: "Data not added", error: err });
          }
        });
    }
    catch (err) {
      return res.status(500).json({ success: false, message: "Something went wrong", error: err || null });
    }
};