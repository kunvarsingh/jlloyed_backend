var mongoose = require('mongoose');
var Schema = mongoose.Schema;

     var userSchema = new Schema({
            first_name :               { type : String},
            last_name :               { type : String},
            company_name :  { type : String,require :true,unique:true},
            license_start_date : { type  : Date,default : Date.now},
            license_end_date : { type  : Date,default : Date.now},
            company_license : { type  : String, default : 'active'},
            Password  :               { type : String  },
            Email     :               { type : String , required : true},
            verificationToken  :      { type : String},
            resetPasswordToken  : { type: String},
            resetPasswordExpires: { type: Date},
            CreatedAt :               { type  : Date ,default : Date.now },
            IsDelete :                { type : Boolean , default : false }
   });
module.exports = mongoose.model('user',userSchema);
