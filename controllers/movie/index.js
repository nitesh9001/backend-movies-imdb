const express = require("express");
const Movie = require("../../Models/movie");
var dotenv = require("dotenv").config();
const mongoose = require('mongoose');
const multer=require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWSACCESSKEYID,
  secretAccessKey: process.env.AWSSECERETKEY,
});
//s3
const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

//local disk
// const storage = multer.diskStorage({
//     destination: "./uploads/",
//     filename: function(req, file, cb){
//        cb(null,"files-" + Date.now() + path.extname(file.originalname));
//     }
//  });
 
const upload = multer({
  storage: storage,
}).single("file");
 
exports.list = async (req, res, next) => {
    try {
        const { sort , id, type, search } = req.body;
       
        var regex;
        if(search){
           regex = new RegExp(search, "i");
        }
        const filterById =  id ? { "$match" : {_id : mongoose.Types.ObjectId(id)}} : { "$match" : {}};
        const sortingData =  sort ? { "$sort" :  sort } : { "$sort" :  { _id : 1} };
        const searchRegex = search ? {"$match" : {
          $or:[ { title: regex }, {director: regex}]
        } } : { "$match" : {}};
        const movieList = await Movie.aggregate([
        filterById,
        searchRegex,
        { $lookup: {
            from: "admins",
            localField: "creator",
            foreignField: "_id",
            as: "creator"
          }
        },
        { $lookup: {
            from: "genres",
            localField: "genres",
            foreignField: "_id",
            as: "genres"
          }
        },
        sortingData,
        { $project: {
            // "creator._id": 0,
            "creator.password": 0,
            "creator.createdAt": 0,
            "creator.updatedAt": 0,
            "creator.__v": 0,
            "creator.status":0,
            // "genres.createdAt": 0,
            // "genres.updatedAt": 0,
            // "genres.__v": 0,
            // "genres.status":0,
            "__v": 0,
            // "posterurl":0
          }
        }]);

        if(type !== '' && type ){
          const dataFiltered = movieList?.filter(function(data) {
            const val = data.genres.map(d => d.type.toLowerCase() === type.toLowerCase());
            return val.includes(true);
          })
          return res.status(200).json({ success: true, data: dataFiltered });
        }
       return res.status(200).json({ success: true, data: movieList });
  } catch (err) {
    return res.status(500).json({ success: false,  message: "Some internal error", error: err || null });
  }
};

exports.addMovie = async (req, res, next) => {
    try{
      upload(req, res, async () => {
      const request = req.body;
      const genreData = [];
      if(!req.file){
        return res.status(200).json({ success: false, message: "Oops ! File is mendatory", error: "file path is not found" });
      }
  
      const genres = () => {
        JSON.parse(req.body?.genres).map(element => {
        genreData.push(mongoose.Types.ObjectId(element));
      });
        return genreData
      }
      const item = req.file;
      let myFile = item.originalname.split(".");
      const fileType = myFile[myFile.length - 1];       
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}.${fileType}`,
        Body: item.buffer,
      };

      s3.upload(params, async(error, data) => {
      if (error) {
        return res.status(200).json({
          success: false,
          error: error,
          message: "Error in s3 bucket uploading "
        });
      } else {
          const movie = await new Movie({
          posterurl: {
            data: data?.Location, 
            contentType : req.file?.mimetype
          },
          title: request.title,
          desription: request.desription,
          storyline: request.storyline,
          director: request.director,
          writer: request.writer,
          releaseDate: request.releaseDate,
          language: JSON.parse(request.language),
          year: request.year,
          duration: request.duration,
          rating: request.rating,
          genres: genres(),
          stars: JSON.parse(request.stars),
          status: JSON.parse(request.status),
          creator: mongoose.Types.ObjectId(request.creator)
      });
      movie.save()
    .then((data) => {
        return res.status(200).json({
          success: true,
          data: data,
          message: "Added sucessfully"
        });
    })
    .catch((err) => {
          return res.status(200).json({ success: false, message: "Oops ! Data not added", error: err });
    });
    }
   });
  })
  }
    catch (err) {
      return res.status(500).json({ success: false, message: "Something went wrong", error: err || null });
    }
};

exports.search = async (req, res, next) => {
    
    const { search } = req.body;
    try{
       var regex = new RegExp(search, "i");
       const serachData = await Movie.find( { $or:[ { title: regex }, {director: regex}]});
       return res.status(200).json({ success: true, data: serachData });
    }
    catch (err) {
       return res.status(500).json({ success: false, message: "Something went wrong", error: err || null });
    }
};

const authValidator = async (user_id, movie_id) => {
  var data
   await Movie.findById(movie_id)
   .then(res => {
     data = res?.creator?.toString() === user_id?.id?.toString()
    console.log("auth validator",res?.creator?.toString(), user_id?.id?.toString(),data)
  })
    return data;
}

exports.editMovie = async (req, res, next) => {
    
    const { movie_id } = req.params;
    const user_id  = req.user;
    try{
        if( !movie_id ){
           return res.status(200).json({ success: false, message: "movie_id not found"});
        }
        
        var isAuthBool ;
        await Movie.findById(movie_id)
        .then(res => {
          isAuthBool = res?.creator?.toString() === user_id?.id?.toString()
          console.log("auth validator",res?.creator?.toString(), user_id?.id?.toString())
        });

        console.log(isAuthBool)

        if(!isAuthBool){
         return res.status(200).json({ success: false, message: "you are not authorised to change this data"});
        }
        else{
        upload(req, res, async () => {
        const request = req.body;
        const genreData = []
        const genres = () => {
          JSON.parse(req.body?.genres).map(element => {
            genreData.push(mongoose.Types.ObjectId(element));
        });
          return genreData
       }
       if(!req.file){
           const movies = await Movie.findByIdAndUpdate(
            movie_id,
            { $set: {
                desription: request.desription,
                storyline: request.storyline,
                director: request.director,
                writer: request.writer,
                releaseDate: request.releaseDate,
                language: JSON.parse(request.language),
                year: request.year,
                duration: request.duration,
                rating: request.rating,
                genres: genres(),
                stars: JSON.parse(request.stars),
            } },
            {
                new: true,
                runValidators: true,
            }
       );
        return res.status(200).json({ success: true, data: movies, message: "Update Succesfully" });
       }
       const item = req.file;
      let myFile = item.originalname.split(".");
      const fileType = myFile[myFile.length - 1];       
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}.${fileType}`,
        Body: item.buffer,
      };

      s3.upload(params, async(error, data) => {
      if (error) {
        return res.status(200).json({
          success: false,
          error: error,
          message: "Error in s3 bucket uploading "
        });
      } else {
         await Movie.findByIdAndUpdate(movie_id,
            { $set: {
            posterurl: {
               data: data?.Location, 
               contentType : req.file?.mimetype
            },
            desription: request.desription,
            storyline: request.storyline,
            director: request.director,
            writer: request.writer,
            releaseDate: request.releaseDate,
            language: JSON.parse(request.language),
            year: request.year,
            duration: request.duration,
            rating: request.rating,
            genres: genres(),
            stars: JSON.parse(request.stars),
          }},
          {
              new: true,
              runValidators: true,
          }
        )
        .then((data) => {
          return res.status(200).json({
            success: true,
            data: data,
            message: "Updated sucessfully"
          });
        })
        .catch((err) => {
           return res.status(200).json({ success: false, message: "Oops ! Data not updated", error: err });
        });
      }
     });
    });
  }     
    }
    catch (err) {
      return res.status(500).json({ success: false, message: "Something went wrong", error: err || null });
    }
};

exports.deleteMovie = async (req, res, next) => {
    
    const { movie_id } = req.params;
    const user_id  = req.user;
    try{
       if( !movie_id ){
           return res.status(200).json({ success: false, message: "movie_id not found"});
        }
        var isAuthBool ;
        await Movie.findById(movie_id)
        .then(res => {
          isAuthBool = res?.creator?.toString() === user_id?.id?.toString()
          console.log("auth validator",res?.creator?.toString(), user_id?.id?.toString())
        });

        console.log(isAuthBool)

        if(!isAuthBool){
         return res.status(200).json({ success: false, message: "you are not authorised to change this data"});
        }
        else{
        const removeMovie = await Movie.remove({
        _id: movie_id,
       });
       if(removeMovie.deletedCount === 1 || removeMovie.deletedCount === true ){
          return res.status(202).json({
            success: true,
            data: removeMovie,
            message: "Deleted sucessfully"
          });
        }
      }
    }
      catch (err) {
         return res.status(500).json({ success: false, message: "Something went wrong", error: err || null });
    }
};