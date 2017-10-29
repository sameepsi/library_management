var Library = require('../models/library');

const fetchAll = (req, res, next) => {
  let query = {};
  if(req.query.library_id){
    query['_id'] = req.query.library_id;
  }
  Library.find(query)
  .then((libraries)=>{
    res.status(200).send(libraries);
  })
  .catch(err=>{
    res.send(500).send({message:err.message});
  });
};

const create = (req, res, next) => {
  var role = req.decoded.role;
  if(role!=='ROOT'){
    return res.status(400).send({message:'Unauthorized request'});
  }
  var name = req.body.name;
  var description = req.body.description;

  if(!name || name.trim().length<=0){
    return res.status(400).send({
      message:'Please provide valid library name'
    });
  }

  var library = new Library({
    name, description
  });
  library.save()
  .then(savedLibrary => {
    res.status(200).send(savedLibrary);
  })
  .catch(err=>{
    res.status(500).send({
      message:err.message
    });
  });
};

module.exports = {
  fetchAll,
  create
};
