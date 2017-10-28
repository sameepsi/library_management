const mongoose = require('mongoose');

const LibrarySchema = mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  description:{
    type:String
  }
});

var Library = mongoose.model('library',LibrarySchema);

module.exports = Library ;
