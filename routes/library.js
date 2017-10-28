var express = require('express');
var router = express.Router();

var authenticationUtil = require('../auth/authenticationUtil')
var controller = require('../controllers/library');


/*GET /library to get list of libraries
*/
//TODO- it can also be paginated. For now not putting pagination into it.
router.get('/', controller.fetchAll);


router.use(authenticationUtil.verifyToken);


/*POST /library add new library
Only ROOT user can call this end-point
@param @required @header x-access-token- valid access token for the user
@param @required @body name
@param @body description
*/
router.post("/", controller.create);

module.exports = router;
