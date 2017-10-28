const jwt = require('jsonwebtoken');
var redis = require("redis");
var  redisClient = redis.createClient(process.env.REDIS_URL);

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

const verifyToken = (req, res, next)=>{
  // check header or url parameters or post parameters for token
  var token = req.headers['x-access-token'];
  // decode token
  if (token) {
    //verify token is not revoked
    redisClient.get(token, function(err, value) {
      if(err){
        return res.status(401).send({message:'Unauthorized request'});
      }
      if(value && value !==null){
        res.status(401).send({message:'Unauthorized request'});
      }
      else{
        // verifies secret and checks exp
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
          if (err) {
            var message = err.message;
            if(err.name==='TokenExpiredError'){
              message = 'token expired'
            }
            return res.status(401).send({message});
          } else {
            // if everything is good, save to request for use in other routes
            req.decoded = decoded;
            next();
          }
        });
      }
    });
  } else {

    // if there is no token
    // return an error
    return res.status(403).send({

      message: 'No token provided.'
    });

  }
}

const generateAuthToken =  (user) => {
  console.log(user)
  var token = jwt.sign({
    exp: Math.floor(Date.now() / 1000) + (60*60*4),//tokens will be valid only for 4 hours
    _id: user._id.toHexString(),
    library:user.role!=='ROOT'?user.library._id.toHexString():"",
    role:user.role
  }, process.env.JWT_SECRET).toString();
  return token;
};

const revokeToken = (token) => {
  // check if token is still valid
  var decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  var expirationTime = decodedToken.exp;
  var remainingTime = expirationTime - Date.now()/1000;
  redisClient.set(token, decodedToken._id, 'EX', Math.floor(remainingTime));
}
module.exports = {
  verifyToken,
  generateAuthToken,
  revokeToken
}
