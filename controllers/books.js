var Book = require('../models/book');
var User = require('../models/user');

const create = (req, res, next) => {
  var role = req.decoded.role;
  if(role!=='ROOT'){
    return res.status(400).send({message:'Unauthorized request'});
  }
  var name = req.body.name;
  var description = req.body.description;
  var library_id = req.body.library_id;
  if(!name || name.trim().length<=0){
    return res.status(400).send({
      message:'Please provide valid book name'
    });
  }
  if(!library_id){
    return res.status(400).send({
      message:'Please provide valid library id'
    });
  }
  var book = new Book({
    name,
    description,
    library:library_id
  });
  book.save().then((savedBook)=>{
    res.status(200).send(savedBook);
  }).catch((err)=>{
    res.status(500).send({
      message:err.message
    });
  });
};

const fetchAvailableBooks = (req, res, next) => {
  var library_id = req.query['library_id'];
  var limit = req.query['limit'] || 10;
  var page = req.query['page'] || 1;
  if(!library_id){
    return res.status(400).send({
      message:'Please provide valid library id'
    });
  }
  Book.paginate({
    is_available:true,
    library:library_id
  },{page, limit, populate:'library'})
  .then(books => {
    res.status(200).send(books);
  })
  .catch((err)=>{
    res.status(500).send({
      message:err.message
    });
  });
};

const issueBook = (req, res, next) => {
  var bookId = req.body.book_id;
  var user_id = req.decoded._id;
  var user_library = req.decoded.library;
  Book.findById(bookId)
  .then(book=>{
    if(!book.library.equals(user_library)){
      return res.status(400).send({
        message:'Not registered in the library'
      });
    }
    if(book.is_available===false){
      return res.status(400).send({
        message:'Book not available'
      });
    }
    return Book.findOneAndUpdate({
      _id:bookId,
      is_available:true
    },{
      $set:{
        is_available:false
      }
    },{new:true})
    .then(book=>{
      return User.findOneAndUpdate({
        _id:user_id
      },{
        $push: {"books": bookId}
      },{new:true}).populate('books').exec()
    }).then(user=>{
      res.status(200).send(user.books)
    })
  })
  .catch((err)=>{
    res.status(500).send({
      message:err.message
    });
  });
};
const returnBook = (req, res, next) => {
  var bookId = req.body.book_id;
  var user_id = req.decoded._id;
  User.findById(user_id)
  .then((user)=>{
    var index = user.books.indexOf(bookId);
    if(index===-1){
      //book is not issued to this user
      return res.status(400).send({
        message:"Unauthorized request"
      });
    }
    else{
      User.findOneAndUpdate({
        _id:user_id
      },{
        $pull:{
          "books":bookId
        }
      },{new: true})
      .populate("books")
      .exec()
      .then((updatedUser) => {
        Book.findOneAndUpdate({
          _id:bookId
        },{
          $set:{
            is_available:true
          }
        },{new: true})
        .then(()=>{
          res.status(200).send(updatedUser.books)
        })
        .catch((err)=>{
          res.status(500).send({
            message: err.message
          });
        })
      })
      .catch((err)=>{
        res.status(500).send({
          message: err.message
        });
      })
    }
  })
  .catch((err)=>{
    res.status(500).send({
      message: err.message
    });
  });
};


module.exports = {
  create,
  fetchAvailableBooks,
  issueBook,
  returnBook
};
