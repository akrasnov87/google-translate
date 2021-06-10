// https://medium.com/analytics-vidhya/how-to-use-google-cloud-translation-api-with-nodejs-6bdccc0c2218

process.env.GOOGLE_APPLICATION_CREDENTIALS = pth.join(__dirname, 'mobile-walker-72293ee4ca27.json');

const pth = require('path')
const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate();

const text = [];

async function detectLanguage() {
    let [detections] = await translate.translate(text, "ru");
    detections = Array.isArray(detections) ? detections : [detections];
    
    console.log("Detections:");
    detections.forEach((detection) => {
        console.log(detection);
    });
}

detectLanguage();