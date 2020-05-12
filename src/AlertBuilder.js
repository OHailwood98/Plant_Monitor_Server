import {sendReadingAlert} from "./mailer";

const tooWet = [
    "Get me out of here quick! I've almost got trench-root!",
    "Do you think I'm some kind of Iris? I need less water!",
    "I'm almost drowning over here!",
    "What is wrong with you! this is supposed to be a plant pot not a pool.",
    "I told you I needed better drainage than this, but did you listen to me?"
]

const tooDry = [
    "OI! I'm not a cactus, I'm parched over here.",
    "Quick! water me before my grapes turn to raisins!",
    "Hurry up, my leaves are starting to turn brown!",
    "Have you abandonded me here to die of thirst?"
]

const tooCold = [
    "This climate change talk is rubbish, I'm freezing in here.",
    "Brrr, did you leave the door open again? I'm shivvering",
    "I'm about 10 minutes from being an iceberg lettuce here, warm me up!",
    "I can see icicles on my leaves now, this isn't funny.",
    "Can't you tell I prefer a tropical environment!"
]

const tooHot = [
    "Christ on a bike, I'm sweating like a dyslexic on Countdown",
    "You need to open a window in here, its boiling!",
    "I know how one of those rotisserie chickens feel now!",
    "You'll love the window sill they said, its nice and sunny they said, they didn't tell me I was going to roast up here!",
    "I honestly don't know how those pineapple plants do it, the heat is making me wilt already."
]

export function emailAlert(user, device, type){
    switch(type){
        case "wet":
            var message = tooWet[Math.floor(Math.random() * tooWet.length)];
            sendReadingAlert(user, device, message, "Soil Moisture is too high")
            break;
        case "dry":
            var message = tooDry[Math.floor(Math.random() * tooDry.length)];
            sendReadingAlert(user, device, message, "Soil Moisture is too low")
            break;
        case "hot":
            var message = tooHot[Math.floor(Math.random() * tooHot.length)];
            sendReadingAlert(user, device, message, "Temperature is too high")
            break;
        case "cold":
            var message = tooCold[Math.floor(Math.random() * tooCold.length)];
            sendReadingAlert(user, device, message, "Temperature is too low")
            break;
    }

}
