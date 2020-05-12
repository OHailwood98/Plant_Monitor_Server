import express from "express";
import decode from "jwt-decode";
import Axios from "axios";

import Device from "../models/device"
import User from "../models/user"

const router = express.Router();

router.post("/deviceinfo", (req, res) => {
    var {id} = req.body
    var token = decode(req.headers.authorisation);
    var user = token.username;

    Device.findOne({deviceID:id, username:user}).then(foundDevice =>{
        if(foundDevice){
            var newDev = {
                deviceID: foundDevice.deviceID,
                deviceName: foundDevice.deviceName,
                username: foundDevice.username,
                tempMin: foundDevice.tempMin.toString(),
                tempMax: foundDevice.tempMax.toString(),
                moistMin: foundDevice.moistMin.toString(),
                moistMax: foundDevice.moistMax.toString()
            }
            res.status(200).json({device: newDev})
        }else{
            res.status(400).json({ errors: { global: "Invalid ID" } });
        }
    })
    .catch(err => res.status(400).json({ errors: err.errors })); 
})

router.post("/adddevice", (req,res) =>{
    var newDevice = req.body.device
    var token = decode(req.headers.authorisation);
    var user = token.username;

    const device = new Device({
        deviceID: newDevice.deviceID,
        deviceName: newDevice.deviceName,
        username: user
    })

    device.save()
        .then(dev=>{
            res.status(200).json({success: true})  
        })
        .catch(err => res.status(400).json({ errors: err.errors })); 
})

router.post("/editdevice", (req,res) =>{
    var device = req.body.device
    var token = decode(req.headers.authorisation);
    var user = token.username;

    Device.findOneAndUpdate({deviceID:device.deviceID, username:user},
    {
        deviceName: device.deviceName,
        tempMin: parseInt(device.tempMin),
        tempMax: parseInt(device.tempMax),
        moistMin: parseInt(device.moistMin),
        moistMax: parseInt(device.moistMax),
    },function(result){
        res.status(200).json({success: true})  
    })
    .catch(err => res.status(400).json({ errors: err.errors })); 

})

router.post("/water", (req,res) =>{
    var {id} = req.body
    var token = decode(req.headers.authorisation);
    var user = token.username;

    Device.findOne({deviceID:id, username:user})
        .then(device =>{
            if(device){
                //keep getting connection errors when trying to communicate with flask server on raspberry pi
                res.status(200).json({success: true})
            }else{
                res.status(400).json({ errors: {global: "Device Not Found"} })
            }
        })
        .catch(err => res.status(400).json({ errors: err.errors })); 
})

export default router;