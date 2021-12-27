const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const connectDB = async () => {
    try{
     const conn = await mongoose.connect(process.env.MONGODGBURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
     });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.log(`MongoDB connection err: ${err}`);
  }
}

module.exports = connectDB;