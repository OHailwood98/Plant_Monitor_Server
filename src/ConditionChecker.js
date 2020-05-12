import Moment from "moment"

import Device from "./models/device"
import User from "./models/user"
import {Alert} from "./AlertBuilder"

export function checkRanges(reading){
    Device.findOne({deviceID:reading.deviceID})
        .then(device =>{
            User.findOne({username: device.username})
            .then(user =>{
                var tempCheck = checkTemps(reading.temperature, device.tempMin, device.tempMax)
                var moistCheck = checkMoist(reading.moisture, device.moistMin, device.moistMax)
                
                if(moistCheck == 1){
                    checkAlertTime(user, device, "wet")
                }
                if(moistCheck == -1){
                    checkAlertTime(user, device, "dry")
                }

                if(tempCheck == 1){
                    checkAlertTime(user, device, "hot")
                }
                if(tempCheck == -1){
                    checkAlertTime(user, device, "cold")
                }
            })
        })
}

function checkTemps(temperature, tempMin, tempMax){
    if((tempMin==0)&&(tempMax==0)){
        return 0;
    }else if(temperature < tempMin){
        return -1;
    }else if(temperature > tempMax){
        return 1;
    }else{
        return 0;
    }
}

function checkMoist(moisture, moistMin, moistMax){
    if((moistMin==0)&&(moistMax==0)){
        return 0;
    }else if(moisture < moistMin){
        return -1;
    }else if(moisture > moistMax){
        return 1;
    }else{
        return 0;
    }
}

function checkAlertTime(user, device, type){
    var currentTime = new Date();
    currentTime.setTime( currentTime.getTime() - new Date().getTimezoneOffset()*60*1000 );
    if(device.lastMessage){
        var lastTime = Moment(device.lastMessage);
        var duration = Math.abs(lastTime.diff(currentTime, 'hours', true));
        if(duration > 2){
            Alert(user, device, type);
            Device.findOneAndUpdate({deviceID:device.deviceID}, {lastMessage: currentTime})
                .catch(err =>{})
        }
    }else{
        Alert(user, device, type);
        Device.findOneAndUpdate({deviceID:device.deviceID}, {lastMessage: currentTime})
            .catch(err =>{})
    }

}