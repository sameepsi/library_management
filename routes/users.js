var express = require('express');
var router = express.Router();

var authenticationUtil = require('../auth/authenticationUtil')
var controller = require('../controllers/user')

/* POST /users Add new user in the system.
@param @required @body email- should be valid and unqiue email address
@param @required @body passowrd- value for the password
@param @required @body library_id- id of the library in which user want to register
*/
router.post('/', controller.create);

/*POST /users/login for user login
@param @required @body email
@param @required @body password
*/
router.post('/login', controller.login);

router.use(authenticationUtil.verifyToken);

/*POST /logout to logout user
@param @required @header x-access-token- valid access token for the user
*/
router.post('/logout', controller.logout);

/*GET /users/books
@param @required @header x-access-token- valid access token for the user
Returns all books issued to the requesting user
*/
router.get("/books", controller.fetchUserIssuedBooks);
module.exports = router;
