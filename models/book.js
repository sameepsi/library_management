var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');

const BookSchema = mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  description:{
    type:String
  },
  library:{
    type: mongoose.Schema.Types.ObjectId, ref: 'library'
  },
  is_available:{
    type:Boolean,
    default:true
  }
});
BookSchema.plugin(mongoosePaginate);

var Book = mongoose.model("book", BookSchema);

module.exports = Book;
