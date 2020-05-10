import express from "express";
import decode from "jwt-decode";

import Reading from "../models/reading";
import Device from "../models/device";

const router = express.Router();

router.post("/add", (req, res) => {
  const { data } = req.body;
  var date = new Date();

  var hour = data.time.split(":")[0];
  var min = data.time.split(":")[1];
  date.setHours(hour);
  date.setMinutes(min);
  date.setSeconds(0);

  const reading = new Reading({
    deviceID: data.deviceID,
    temperature: parseInt(data.temp),
    moisture: parseInt(data.moisture),
    light: parseInt(data.light),
    time: date
  });

  reading
    .save()
    .then((reading) => {
      res.status(200).json({success: true});
    })
    .catch((err) => res.status(400));
});

router.post("/getoneday", (req, res) => {
  var {id} = req.body;
  var token = decode(req.headers.authorisation);
  var user = token.username;

  var lte = new Date();
  lte.setHours(0);
  lte.setMinutes(0);

  var gte = new Date();
  gte.setHours(0);
  gte.setMinutes(0);
  gte.setDate(gte.getDate() - 1);

  var timeArray = [];
  var averageTimes = [];

  Device.findOne({deviceID: id, username: user})
    .then(device =>{
      if(device){
        Reading.find({deviceID:id, time: { $gte: gte.toISOString(), $lte: lte.toISOString() } })
          .sort({ time: -1 })
          .then((times) => {
            times.forEach((time) => {
              var newTime = {
                deviceID: time.deviceID,
                temperature: time.temperature,
                moisture: time.moisture,
                light: time.light,
                time: time.time,
              };
              timeArray.push(newTime);
            });
            for (var i = 0; i < 24; i++) {
              var time = getDayAverage(timeArray, i);
              averageTimes.push(time);
            }
            res.status(200).json({ timeList: averageTimes });
          })
          .catch((err) => res.status(400).json({ errors: {global: "Server Error. Try Again"} }));
      }else{
        res.status(400).json({ errors: {global: "Invalid ID"} });
      }
    }) 
});

router.post("/getoneweek", (req, res) => {
  var {id} = req.body;
  var token = decode(req.headers.authorisation);
  var user = token.username;

  var lte = new Date();
  lte.setHours(0);
  lte.setMinutes(0);

  var gte = new Date();
  gte.setHours(0);
  gte.setMinutes(0);
  gte.setDate(gte.getDate() - 7);

  var timeArray = [];
  var averageTimes = [];
  
  Device.findOne({deviceID: id, username: user})
  .then(device =>{
    if(device){
      Reading.find({deviceID:id, time: { $gte: gte.toISOString(), $lte: lte.toISOString() } })
        .sort({ time: -1 })
        .then((times) => {
          times.forEach((time) => {
            var newTime = {
              deviceID: time.deviceID,
              temperature: time.temperature,
              moisture: time.moisture,
              light: time.light,
              time: time.time,
            };
            timeArray.push(newTime);
          });
          for (var i = 1; i < 8; i++) {
            var time = getWeekAverage(timeArray, i);
            averageTimes.push(time);
          }
          res.status(200).json({ timeList: averageTimes });
        })
        .catch((err) => res.status(400).json({ errors: {global: "Server Error. Try Again"} }));
    }else{
      res.status(400).json({ errors: {global: "Invalid ID"} });
    }
  })
});

router.post("/getonemonth", (req, res) => {
  var {id} = req.body;
  var token = decode(req.headers.authorisation);
  var user = token.username;

  var lte = new Date();
  lte.setHours(0);
  lte.setMinutes(0);

  var DiM = DaysinMonth(lte.getMonth() + 1, lte.getFullYear());

  var gte = new Date();
  gte.setHours(0);
  gte.setMinutes(0);
  gte.setDate(gte.getDate() - DiM);

  var timeArray = [];
  var averageTimes = [];

  Device.findOne({deviceID: id, username: user})
  .then(device =>{
    if(device){
      Reading.find({deviceID:id, time: { $gte: gte.toISOString(), $lte: lte.toISOString() } })
        .sort({ time: -1 })
        .then((times) => {
          times.forEach((time) => {
            var newTime = {
              deviceID: time.deviceID,
              temperature: time.temperature,
              moisture: time.moisture,
              light: time.light,
              time: time.time,
            };
            timeArray.push(newTime);
          });
          for (var i = 1; i <= DiM; i++) {
            var time = getMonthAverage(timeArray, i);
            averageTimes.push(time);
          }
          res.status(200).json({ timeList: averageTimes });
        })
        .catch((err) => res.status(400).json({ errors: {global: "Server Error. Try Again"} }));
    }else{
      res.status(400).json({ errors: {global: "Invalid ID"} });
    }
  })
});

function getDayAverage(times, hour) {
  var chosenTimes = [];
  var day = new Date();

  day.setDate(day.getDate() - 1);
  day.setHours(hour);
  day.setMinutes(0);

  var timeStr = day.toLocaleDateString();
  timeStr += `, ${hour}:00`

  times.forEach((time) => {
    if (time.time.getHours() === hour) {
      chosenTimes.push(time);
    }
  });

  if (chosenTimes.length === 0) {
    var averageReading = {
      deviceID: 0,
      moisture: 0,
      temperature: 0,
      light: 0,
      time: hour+":00",
      name: timeStr
    };
    return averageReading;
  } else {
    var average = averageReadings(chosenTimes);
    return average;
  }
}

function getWeekAverage(times, day) {
  var average = [];
  var AM6 = [];
  var AM12 = [];
  var PM6 = [];
  var PM12 = [];

  var day2find = new Date();
  day2find.setDate(day2find.getDate() - day);

  times.forEach((time) => {
    if (time.time.getDate() == day2find.getDate()) {
      if (time.time.getHours() < 6) {
        AM6.push(time);
      } else if (time.time.getHours() >= 6 && time.time.getHours() < 12) {
        AM12.push(time);
      } else if (time.time.getHours() >= 12 && time.time.getHours() < 18) {
        PM6.push(time);
      } else {
        PM12.push(time);
      }
    }
  });

  if (AM6.length === 0) {
    AM6 = {
      deviceID: 0,
      moisture: 0,
      temperature: 0,
      light: 0,
      time: day2find,
    };
  } else {
    AM6 = averageReadings(AM6);
  }
  AM6.time.setHours(3);
  AM6.time.setMinutes(0);
  average.push(AM6);

  if (AM12.length === 0) {
    AM12 = {
      deviceID: 0,
      moisture: 0,
      temperature: 0,
      light: 0,
      time: day2find,
    };
  } else {
    AM12 = averageReadings(AM12);
  }
  AM12.time.setHours(9);
  AM12.time.setMinutes(0);
  average.push(AM12);

  if (PM6.length === 0) {
    PM6 = {
      deviceID: 0,
      moisture: 0,
      temperature: 0,
      light: 0,
      time: day2find,
    };
  } else {
    PM6 = averageReadings(PM6);
  }
  PM6.time.setHours(15);
  PM6.time.setMinutes(0);
  average.push(PM6);

  if (PM12.length === 0) {
    PM12 = {
      deviceID: 0,
      moisture: 0,
      temperature: 0,
      light: 0,
      time: day2find,
    };
  } else {
    PM12 = averageReadings(PM12);
  }
  PM12.time.setHours(21);
  PM12.time.setMinutes(0);
  average.push(PM12);

  return average;
}

function getMonthAverage(times, day) {
  var chosenTimes = [];

  var day2find = new Date();
  day2find.setDate(day2find.getDate() - day);
  day2find.setHours(12);
  day2find.setMinutes(0);

  times.forEach((time) => {
    if (time.time.getDate() == day2find.getDate()) {
      chosenTimes.push(time);
    }
  });

  if (chosenTimes.length === 0) {
    var averageReading = {
      deviceID: 0,
      moisture: 0,
      temperature: 0,
      light: 0,
      time: day2find,
    };
    return averageReading;
  } else {
    var average = averageReadings(chosenTimes);
    average.time.setHours(12);
    average.time.setMinutes(0);
    return average;
  }
}

function averageReadings(times) {
  var len = times.length;
  var id = times[0].deviceID;

  var moisture = 0;
  var temperature = 0;
  var light = 0;

  times.forEach((time) => {
    moisture += time.moisture;
    temperature += time.temperature;
    light += time.light;
  });

  moisture = moisture / len;
  temperature = temperature / len;
  light = light / len;

  moisture = Math.round(moisture * 10) / 10
  temperature = Math.round(temperature * 10) / 10
  light = Math.round(light * 10) / 10

  var averageTime = times[0].time;
  var hour = averageTime.getHours();
  var timeStr = averageTime.toLocaleDateString();
  timeStr += `, ${hour}:00`

  var averageReading = {
    deviceID: id,
    moisture: moisture,
    temperature: temperature,
    light: light,
    time: hour+":00",
    name: timeStr
  };

  return averageReading;
}

function DaysinMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

export default router;
