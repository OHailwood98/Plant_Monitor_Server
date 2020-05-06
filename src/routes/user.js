import express from "express";
import decode from "jwt-decode";

import User from "../models/user";
import Device from "../models/device"
import {sendConfirmEmail} from '../mailer'

const router = express.Router();

router.post("/signup", (req, res) => {
  const { credentials } = req.body;

  const user = new User({
    email: credentials.email,
    username: credentials.username,
    phone: credentials.phone,
  });
  if(credentials.contact === "phone"){
    user.contact.email = false;
    user.contact.phone = true;
  }

  const newDevice = new Device({
    deviceID: credentials.deviceID,
    deviceName: credentials.deviceName,
    username: credentials.username
  })

  Device.findOne({deviceID: credentials.deviceID}).then(device =>{
    if(device){
      res.status(400).json({ errors: {deviceID:{message:"Invalid Device ID"}} })
    }else{
      user.setPassword(credentials.password);
      user.setConfirmToken();
      user
        .save()
        .then(user => {
          newDevice.save()
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
  Device.find({ username: user }).then(devices => {
    var deviceArr = []
    devices.forEach(device =>{
      deviceArr.push({devID: device.deviceID, name: device.deviceName})
    })
    res.status(200).json({devices:deviceArr})
  })
  .catch(err =>{
    res.status(400).json({errors: {global:"User Not Found" }})
  })
})

export default router;
