// External module import via NPM manager------------------------
var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var mongoose  = require('mongoose');
var bcrypt = require('bcrypt');
var cors = require('cors');

// import routing files----------------------
var USER =require('./routes/userRout');
var CONST = require('./config/constant');

var User = require('./app/models/userModel.js');

var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(bodyparser.urlencoded({ extended : false ,limit: '50mb'}));
app.use(bodyparser.json({limit: '50mb', extended: true}));
app.use(cors());
var port = 3000;
// --------------------------------------MONGODB Connection--------------------------------------
mongoose.connect(CONST.wnsConstant.DBURL, function(data,err){
	if(!err) console.log("Error to connect MONGODB :",err);
	console.log("MONGODB connection successfully: Smart Controls");
});
// --------------------------------------END MONGODB Connection--------------------------------------


// --------------------------------------ROUTING for user module--------------------------------------
app.use('/user',USER);

app.get('/',function(req,res){
  res.send({message :"Welcome World Teach"});
});

// app.listen(process.env.PORT || port);
app.listen(process.env.PORT || 9000,function(req,res){
  console.log("Node server is start 9000 is Running......................... ");
   bcrypt.hash('admin@123', 10, (err, hash)=> {
                      if (err) {
                          return res.json({ message: "unable to bcrypt the password",status: 200 })
                        } 
                        else if (hash){
                          let requestObj = {
                            company_name: 'Admin',
                            first_name : 'admin',
                            last_name : '',
                            Email : 'admin@gmail.com',
                            Password: hash,
                            };
                            User.find({Email : requestObj.Email},{},(err,data)=>{
                            	// console.log(data)
                            	if(data.length){
                            		console.log('Super admin already created')
                            	}else{
                            		 User.create(requestObj,(err, data)=>{
                                if (err) {
                                      console.log('error to save super admin', err);
                                     } else if (data) {
                                      requestObj.savePassword = requestObj.Password;
                                        console.log("Your account created successfully!.")
                                    }
                              });
                                console.log('Super admin created successfully!\n email : admin@gmail.com \n password : admin@123')
                            	}
                            })
                          }
      })
})
module.exports = app;
