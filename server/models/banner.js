const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image1: {
    type: String,
    required: true
  },
  image2: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
  ,
  name:{
    type: String,
    default:'offerbanner'
  }
});

module.exports = mongoose.model('Banner', bannerSchema);