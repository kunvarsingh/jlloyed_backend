// External module import via NPM manager------------------------
var express = require('express');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');


// Modals and custome file import
var User = require('../models/userModel.js');
var CONST = require('../../config/constant');

// ----------------------------Registeration-------------------------------
/* Kunvar singh 24-11-2018
   Description : Register with mongodb using this API*/
// -----------------------------------------------------------

var registration = (req, res)=>{

      let Password = req.body.password;
      let confirmpassword = req.body.password;
      let Email = req.body.email;
      let company_name = req.body.company_name;
      let first_name = req.body.first_name;
      let last_name = req.body.last_name;
      var token;

      if(confirmpassword == Password) {

            User.findOne({company_name:company_name.toLowerCase()},{},(err,data)=>{
              if(err){  return res.json({ message : "Error occured on server!",status : 400, data : err}) }
                 
                 if(!data){
                   crypto.randomBytes(10,(err,buf)=>{
                     token = buf.toString('hex');
                     req.body.verificationToken = token;
                   });

                    bcrypt.hash(Password, 10, (err, hash)=> {
                      if (err) {
                          return res.json({ message: "unable to bcrypt the password",status: 200 })
                        } 
                        else if (hash){
                              let requestObj = {
                                  first_name: first_name,
                                  last_name : last_name,
                                  company_name : company_name.toLowerCase(),
                                  Email : Email,
                                  Password: hash,
                                  company_license : 'active'
                                  };

                                  if(requestObj.company_name && requestObj.Email){
                                    User.create(requestObj,(err, data)=>{
                                      if (err) {
                                            console.log('errrrrrrrrrrrrrrrrrr', err);
                                             return res.json({ message: "error, There is unable to store record in db",status: 400 })
                                           } else if (data) {
                                            requestObj.savePassword = Password;
                                              return res.json({message :"Your account created successfully!.",status : 200})
                                          }
                                        else return res.json({ message: "There are an error to get the data", status: 400 });
                                    });
                                  }
                                  else return res.json({ message : "Please enter the all required fields",status : 400 })
                        }
                         else return res.json({  message: "Password is unable to bcrypt the password" , status: 400 })
                });
              }
              else return res.json({message : "This company is already register with us",status : 400});
             });
      }
      else return res.json({ message: "Password and confirmPassword not match", status :400});
    }

// ----------------------------Login-------------------------------
/* Kunvar singh 24-11-2018
   Description : Login with credential usign all the cases*/
// -----------------------------------------------------------
  var login = (req,res)=>{
          var reqObj = {
             Email : req.body.email,
             Password : req.body.password
          };

          if(reqObj.Email && reqObj.Password){
                      User.findOne({Email :req.body.email},{verifyEmail :0},function(err ,data){
                        if(err) return res.json({message : "Err, unable to get the data",err,status : 400})

                        if(data) {
                                bcrypt.compare(reqObj.Password,data.Password,function(err  ,success){
                                if(err) return res.json({message : "unable to campare the password",status : 400,error:err})
                                
                                else if(success){
                                   var token = jwt.sign({id:data._id},'secret',{ expiresIn: '1h' });
                                   data.Password='';
                                   return res.json({status :200, message : "User login successfully",auth : true,token : token , data : data })

                                   var userid =  function(req, res) {
                                                var token = req.headers['token'];
                                                jwt.verify(token, "name", function(err, decoded) {
                                                  if (err) return res.json(err);
                                                  return res.json(decoded);
                                                });
                                            }
                                 }
                                 else return res.json({ message : "Please enter the correct password ",status:400})
                               });
                           }
                           else return res.json({message : "Your email is not register with us, Please signup first!.",status : 400});
                      });
            }
            else return res.json({message : "Please enter email & password!.",status : 400})
   }

var checkCompanyLicense = (req, res)=>{
  let company_name = req.params.id;
  if(company_name){
  User.find({company_name : company_name},{},(err,data)=>{
    if(err) return res.send({message : "Err, unable to get the data",status : 400});
    if(data[0].IsDelete==false && data[0].company_license=='active'){
      return res.json({message : "company license is active!.",status : 200,data : "success"})
    }else{
      return res.json({message : "company license is de-actived!.",status : 400,data : "false"})
    }
  })
  }else{
    return res.json({message : "Please enter company name!.",status : 400})
  }
}

var getCompanyList = (req,res)=>{
   User.find({},{},(err,data)=>{
    if(err) return res.send({message : "Err, unable to get the data",status : 400});
      return res.json({message : "company list!.",status : 200,data : data})
  })
}

var deactivateCompany =  (req, res)=>{
   let companyId = req.body.companyId;
   if(companyId){
  User.findByIdAndUpdate(companyId,
    {IsDelete : true,company_license : 'deactivated'},
      function(err, doc) {
          if(err){
          return res.send({status:400, message:"Error occured to deactivate company!"});
          }else{
          //do stuff
          return res.send({status:200, message:"company deactivate successfully!"});
          }
      }
  );
  }else{
    return res.send({status:400, message:"Please send companyId!"});
  }  
}

var editCompany =  (req, res)=>{
   let companyId = req.body.companyId;
   let license_start_date = req.body.license_start_date;
   let license_end_date = req.body.license_end_date;
   if(companyId){
  User.findByIdAndUpdate(companyId,
    {IsDelete : true, license_end_date : license_end_date ,license_start_date:  license_start_date},
      function(err, doc) {
          if(err){
          return res.send({status:400, message:"Error occured to edit company!"});
          }else{
          //do stuff
          return res.send({status:200, message:"edit company successfully!"});
          }
      }
  );
  }else{
    return res.send({status:400, message:"Please send companyId!"});
  }  
}

var addNewRole = (req, res)=>{
  let userId = req.body.userId;
  let roles = req.body.roles;
  if(userId && roles){
  User.findByIdAndUpdate(req.body.userId,
    {$push: {roles: req.body.roles}},
    {safe: true, upsert: true},
      function(err, doc) {
          if(err){
          return res.send({status:400, message:"Error occured to add new role!"});
          }else{
          //do stuff
          return res.send({status:200, message:"New role added successfully!"});
          }
      }
  );
}else{
  return res.send({status:400, message:"Please send userId and roles!"});
}
}



// Export function for access interact with DB
  exports.registration = registration;
  exports.login  = login;


  exports.addNewRole = addNewRole;




  exports.checkCompanyLicense = checkCompanyLicense;
  exports.getCompanyList = getCompanyList;
  exports.deactivateCompany = deactivateCompany;
  exports.editCompany = editCompany;