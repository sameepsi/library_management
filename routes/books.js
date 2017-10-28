var express = require('express');
var router = express.Router();

var authenticationUtil = require('../auth/authenticationUtil')
var controller = require('../controllers/books');

router.use(authenticationUtil.verifyToken);

/*POST /books add a new book into a library
@param @required @header x-access-token- valid access token for the user
@param @required @body library_id
@param @required @body name
@param @required @body description
*/
router.post("/", controller.create);


/*GET /books all available books inside a library
@param @required @header x-access-token- valid access token for the user
@param @required @query library
@param @query limit- default value is 10. Can not be greater than 100
@param @query page- default value is 1
*/
router.get("/", controller.fetchAvailableBooks);

/*POST /books/issue issue an available book to the user
@param @required @header x-access-token- valid access token for the user
@param @required @body book_id
*/
router.post("/issue", controller.issueBook);

/*POST /books/return return an already issued book
@param @required @header x-access-token- valid access token for the user
@param @required @body book_id
*/
router.post("/return", controller.returnBook);

module.exports = router;
