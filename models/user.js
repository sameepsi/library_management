const mongoose=require('mongoose');
const validator=require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email:{
    type:String,
    required: true,
    trim: true,
    minlength:1,
    unique:true,
    validate: {
      validator:(value) => {
        return validator.isEmail(value);
      },
      message:'{VALUE} is not a valid email'
    }
  },
  password:{
    type:String,
    required: true,
    minlength: 6
  },
  library:{ type: mongoose.Schema.Types.ObjectId, ref: 'library' },
  role:{
    type:String,
    default:'USER'
  },
  books:[
    {type: mongoose.Schema.Types.ObjectId, ref: 'book'}
  ]
});


UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();
  return _.pick(userObject, ['_id', 'email', 'library']);
};

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;
  return User.findOne({email}).populate('library').exec().then((user) => {

    if(!user){
      Promise.reject("Invalid credentials");
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if(res){
          resolve(user);
        }
        reject("Invalid credentials");
      });
    });
  });
};

UserSchema.pre('save', function (next) {
  var user = this;

  if(user.isModified('password')){
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  }else{
    next();
  }
});

var User= mongoose.model('User',UserSchema);


module.exports=User;
