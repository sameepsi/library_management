var authenticationUtil = require('../auth/authenticationUtil');
var User = require('../models/user');
//creates new user in db and returns response with valid token
const create = (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;
  var library_id = req.body.library_id;
  //check for required parameters
  if(!email){
    return res.status(400).send({
      message:'Please provide email address'
    });
  }
  if(!password){
    return res.status(400).send({
      message:'Please provide password'
    });
  }
  if(!library_id){
    return res.status(400).send({
      message:'Please provide library_id'
    });
  }
  var user = new User({
    email, password, library:library_id
  });
  user.save()
  .then((savedUser)=>{
    return User.populate(savedUser, {path:"library"})
    .then(populatedUser=>{
      console.log(populatedUser);
      var token = authenticationUtil.generateAuthToken(populatedUser);
      res.header('x-access-token', token).status(200).send(populatedUser);
    })
    .catch((err)=>{
      console.log(err)
      res.status(500).send({
        message:err.message
      });
    });

  })

  .catch((err)=>{
    console.log(err)
    res.status(500).send({
      message:err.message
    });
  });
};

/*checks whether the requested user credentials are valid or not
If credentials are valid it returns a valid token along with user object
*/
const login = (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;
  if(!email){
    return res.status(400).send({
      message:'Please provide email address'
    });
  }
  if(!password){
    return res.status(400).send({
      message:'Please provide password'
    });
  }
  User.findByCredentials(email, password)
  .then((user)=>{
    var token = authenticationUtil.generateAuthToken(user);
    res.header('x-access-token', token).status(200).send(user);
  })
  .catch((err) => {
    res.status(500).send({message: err.message});
  });

}

//destroys the token. Further requests using that token will be rejected
const logout = (req, res, next) => {
  try{
    var token = req.headers['x-access-token'];
    authenticationUtil.revokeToken(token);
    res.status(200).send("ok");
  }catch(err){
    res.status(500).send({message:err.message});
  }
}

//creates ROOT if not already present
const createRootUser = () => {
  if(!process.env.ROOT_USERNAME || !process.env.ROOT_PASSWORD){
    console.log("no root user config");
    return;
  }
  else{
    User.findOne({
      email:process.env.ROOT_USERNAME,
      role:"ROOT"
    }).then((user)=>{
      if(user){
        console.log("ROOT user already present");
      }
      else{
        var newUser = new User({
          email:process.env.ROOT_USERNAME,
          password:process.env.ROOT_PASSWORD,
          role:"ROOT"
        });
        newUser.save().then(()=>{
          console.log("ROOT user created successfully!!");
        });
      }
    }).catch((err)=>{
      console.log(err);
    });
  }
};

const fetchUserIssuedBooks = (req, res, next) => {
  var userId = req.decoded._id;
  User.findById(userId)
  .populate('books')
  .exec()
  .then(user => {
    res.status(200).send(user.books)
  })
  .catch((err)=>{
    res.status(500).send({
      message: err.message
    });
  });
};
module.exports = {
  create,
  login,
  logout,
  createRootUser,
  fetchUserIssuedBooks
}
