var express = require('express');
var usered = require('../app/controller/userCtrl');
var router = express.Router();

router.get('/', function(req, res){
  res.send({status : 200, message :"I am default route in user module."});
})


// route here for user module----------------------
router.post('/registration', usered.registration);
router.post('/login',usered.login);
router.get('/checkCompanyLicense/:id',usered.checkCompanyLicense);
router.get('/getCompanyList', usered.getCompanyList);
router.put('/deactivateCompany', usered.deactivateCompany);
router.put('/editCompany',usered.editCompany);
module.exports = router;
