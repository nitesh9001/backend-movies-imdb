const Admin = require("../../Models/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var dotenv = require("dotenv").config();

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