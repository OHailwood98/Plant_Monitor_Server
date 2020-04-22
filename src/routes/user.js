import express from "express";
import decode from "jwt-decode";

import User from "../models/user";
import Device from "../models/device"
import {sendConfirmEmail} from '../mailer'

const router = express.Router();

router.post("/signup", (req, res) => {
  const { credentials } = req.body;
  console.log(credentials)
  var deviceArr = []
  deviceArr.push({devID:credentials.deviceID, name: credentials.deviceName})

  const user = new User({
    email: credentials.email,
    username: credentials.username,
    phone: credentials.phone,
    devices: deviceArr
  });
  if(credentials.contact === "phone"){
    user.contact.email = false;
    user.contact.phone = true;
  }

  const device = new Device({
    deviceID: credentials.deviceID,
    deviceName: credentials.deviceName
  })

  Device.findOne({deviceID: credentials.deviceID}).then(device =>{
    if(device){
      res.status(400).json({ errors: {deviceID:{message:"Invalid Device ID"}} })
      console.log("Found")
    }else{
      user.setPassword(credentials.password);
      user.setConfirmToken();
      user
        .save()
        .then(user => {
          device.save()
            .then(device =>{
              sendConfirmEmail(user)
              res.status(200).json({ user: user.toAuthJson() });
            })
            .catch(err => res.status(400).json({ errors: err.errors }));
        })
        .catch(err => res.status(400).json({ errors: err.errors }));
    }
  })
  .catch(err => res.status(400).json({ errors: err.errors }));
});

router.post("/login", (req, res) => {
  const { credentials } = req.body;
  User.findOne({ email: credentials.email }).then(user => {
    if (user && user.passwordCheck(credentials.password)) {
      res.status(200).json({ user: user.toAuthJson() });
    } else {
      res
        .status(400)
        .json({ errors: { global: "Password Incorrect or User Not Found" } });
    }
  });
});

router.post("/updatepassword", (req, res) => {
  const { credentials } = req.body;
  var token = decode(req.headers.authorisation);
  var user = token.username;
  User.findOne({ username: user }).then(user => {
    if (user.passwordCheck(credentials.oldPassword)) {
      if (user.passwordCheck(credentials.newPassword)) {
        res.status(400).json({
          errors: {
            newPassword: "New password cannot match the old password"
          }
        });
      } else {
        user.setPassword(credentials.newPassword);
        user.markModified("passwordHash");
        user
          .save()
          .then(user => {
            res.status(200).json({ user: user.toAuthJson() });
          })
          .catch(err => res.status(400).json({ errors: err.errors }));
      }
    } else {
      res.status(400).json({ errors: { global: "Password Incorrect" } });
    }
  });
});

router.post("/confirm", (req, res)=>{
  User.findOne({EmailConfToken:req.body.token})
      .then(user => {
        user.EmailConfToken = "";
        user.EmailConfd = true;
        user.save();
        res.json({user: user.toAuthJson()})
      })
      .catch(err =>{
        res.status(400).json({errors: {global:"Token Not Found" }})
      })
})

router.get("/getdevices", (req, res)=>{
  var token = decode(req.headers.authorisation);
  var user = token.username;
  User.findOne({ username: user }).then(user => {
    var deviceArr = []
    for(var i=0; i<user.devices.length; i++){
      var dev = user.devices[i]
      deviceArr.push({devID:dev.devID, name:dev.name})
    }
    res.status(200).json({devices:deviceArr})
  })
  .catch(err =>{
    res.status(400).json({errors: {global:"User Not Found" }})
  })
})

export default router;
