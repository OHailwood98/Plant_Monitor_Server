import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "mongoose-unique-validator";

const schema = new mongoose.Schema(
  {
    email: {type: String,required: true,lowercase: true,index: true,unique: true},
    username: { type: String, required: true, unique: true },
    EmailConfd:{type: Boolean, default:false},
    EmailConfToken: {type:String, default: ""},
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true },
    devices:[ String ],
    contact:{
      email:{type: Boolean, default:true},
      phone:{type: Boolean, default:false}
    }
  },
  { timestamps: true }
);

schema.methods.passwordCheck = function passwordCheck(password) {
  return bcrypt.compareSync(password, this.passwordHash, function(err, hash) {
    if (err) throw err;
  });
};

schema.methods.genToken = function genToken() {
  return jwt.sign(
    {
      email: this.email,
      username: this.username,
      email_confirm: this.EmailConfd
    },
    process.env.JWT_SECRET
  );
};

schema.methods.toAuthJson = function toAuthJson() {
  return {
    email: this.email,
    username: this.username,
    email_confirm: this.EmailConfd,
    token: this.genToken()
  };
};

schema.methods.setPassword = function setPassword(password) {
  this.passwordHash = bcrypt.hashSync(password, 10, function(err, hash) {
    if (err) throw err;
  });
};

schema.methods.setConfirmToken = function setConfirmToken(){
  this.EmailConfToken = this.genToken();
}

schema.methods.genConfirmUrl = function genConfirmUrl(){
  return ` ${process.env.HOST}/confirmation/${this.EmailConfToken}`
}

schema.plugin(validator, { message: "duplicate" });
export default mongoose.model("user", schema);
