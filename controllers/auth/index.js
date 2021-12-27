const Admin = require("../../Models/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var dotenv = require("dotenv").config();
const mongoose = require('mongoose');

exports.register = async (req, res, next) => {
    
    const { name, email, password } = req.body;
    try{
    const admin = (await Admin.findOne({email: email})) || null;
    
    if(admin){
     return res.status(200).json({
        success: false,
        message: "Admin already exists"
     })
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHased = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
        name: name,
        email: email,
        status: true,
        password: passwordHased,
    });

    const data = await newAdmin.save();

    const getPayload =await  Admin.findOne({email: email});
    if(!getPayload){
        return res.status(500).json({
          success: false,
          message: "Admin not created",
        });
    } 

    const payload = {
        admin: {
            email : email,
            id: getPayload._id,
        }
    }
    console.log(payload)
    jwt.sign(payload, process.env.JWTSCERET, function(err, token){
       if(err){
           return res.status(500).json({ success: false, message: "Admin not created/error in jwt", error: err });
       }
       console.log(data)
        return res.status(201).json({
            success: true,
            data: {
              _id: data?._id,
              name: name,
              status: true,
              email: email,
              token: token,
            },
          });
     })
    }
    catch (err) {
      return res.status(500).json({ success: false, message: "Admin not created", error: err });
    }
};

exports.login = async (req, res, next) => {
    
    const { email, password } = req.body;
    try{
    const admin = (await Admin.findOne({email: email})) || null;
    
    if(!admin){
     return res.status(200).json({
        success: false,
        message: "Invalid Credentials"
     })
    }

    if (admin.status) {
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          return res.status(200).json({
              success: false,
              message: "Invalid Credentials"});
        }
    }

    const payload = {
        admin: {
            email : email,
            id: admin._id,
        }
    }

    jwt.sign(payload, process.env.JWTSCERET, function(err, token){
        if(err){
           return res.status(500).json({ success: false, message: "Error in jwt", error: err });
        }
        return res.status(200).json({
            success: true,
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                status: admin.status,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
                token: token,
            },
        });
     })
    }
    catch (err) {
      return res.status(500).json({ success: false, message: "Something went wrong", error: err || null });
    }
};

exports.addWtachlater = async (req, res, next) => {
    
    const { movie_id, remove } = req.body;
    const { id } = req.user;

    try{
        if(!movie_id){
            return res.status(200).json({ success: false, message: "movie_id not found", error:  null });
        }
        const admin = await Admin.findById(id);
        if(admin){
            var watchlaterArray = admin?.watchLater;
            console.log(admin?.watchLater.includes(movie_id), remove );
            if(admin?.watchLater.includes(movie_id) && !remove){
                return res.status(200).json({ success: false, message: "Already added" });
            }
            if(admin?.watchLater.includes(movie_id) && remove){
                const data = watchlaterArray.filter(d => d.toString() !== movie_id)
                console.log("dd",data);
                admin.watchLater = data;
            }else{
               watchlaterArray.push(movie_id);
            }
            console.log("final",watchlaterArray);
            admin.save().then(response => {
            return res.status(200).json({ success: true, data: response, message: remove ? "Removed from watch later" : "Added to watch later" });
        }).catch((err) => {
            return res.status(200).json({ success: false, message: "Failed to add watch later", error: err || null });
        });
        }
    }
    catch (err) {
      return res.status(500).json({ success: false, message: "Something went wrong", error: err || null });
    }
};

exports.getWtachlater = async (req, res, next) => {

    const { id } = req.user;

    try{
        const admin = await Admin.aggregate([
         { $match : { _id : mongoose.Types.ObjectId(id)}},
         { $lookup: {
            from: "movies",
            localField: "watchLater",
            foreignField: "_id",
            as: "watchLater"
          }
         },
         { $unwind: {
            path: "$watchLater",
            preserveNullAndEmptyArrays: false
           }
        },
        { $lookup: {
            from: "admins",
            localField: "watchLater.creator",
            foreignField: "_id",
            as: "watchLater.creator"
          }
        },
        { $lookup: {
            from: "genres",
            localField: "watchLater.genres",
            foreignField: "_id",
            as: "watchLater.genres"
          }
        },
        //  { $unwind: {
        //     path: "$watchLater.creator",
        //     preserveNullAndEmptyArrays: false
        //    }
        // },
        { $project: {
            email:0,
            _id:0,
            name:0,
            password: 0,
            status:0,
            createdAt:0,
            updatedAt:0,
            "watchLater.__v":0,
            "watchLater.creator.password": 0,
            "watchLater.creator.createdAt": 0,
            "watchLater.creator.updatedAt": 0,
            "watchLater.creator.__v": 0,
            "watchLater.creator.status":0,
            "watchLater.creator.watchLater":0,
            "watchLater.genres.createdAt": 0,
            "watchLater.genres.updatedAt": 0,
            "watchLater.genres.__v": 0,
            "watchLater.genres.status":0,
             __v:0
         }}
        ]).then(response => {
            var dataResponse=[];
            response.forEach(d => {
                dataResponse.push(d?.watchLater);
            })
            return res.status(200).json({ success: true, data: dataResponse });
        }).catch((err) => {
            return res.status(200).json({ success: false, message: "Failed to add watch later", error: err || null });
        });
    }
    catch (err) {
      return res.status(500).json({ success: false, message: "Something went wrong", error: err || null });
    }
};