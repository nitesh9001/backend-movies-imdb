const mongoose = require('mongoose');

const AdminModel = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
    },
    password: {
      type: String,
      required: true,
    }
},
{
    timestamps: true,
})

module.exports = mongoose.model('admins', AdminModel)