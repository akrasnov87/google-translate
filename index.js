// https://medium.com/analytics-vidhya/how-to-use-google-cloud-translation-api-with-nodejs-6bdccc0c2218

/*
https://github.com/justinklemm/i18n-strings-files
*/
const pth = require('path')

process.env.GOOGLE_APPLICATION_CREDENTIALS = pth.join(__dirname, 'mobile-walker-72293ee4ca27.json');
var args = process.argv.slice(2);
const fs  =require('fs')
const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate();

const language = args[0]
const filePath = args[1]

var output = [];

if (fs.existsSync(filePath)) {

    var content = fs.readFileSync(filePath).toString();
    var lines = content.split('\n');

    function next() {
        var line = lines[0];
        if (line != undefined) {
            lines.shift();

            if(line == '' || line.startsWith('/*')) {
                output.push(line);
                next();
            } else {
                var array = /\"([\s|\S]*)\"\s*=\s*\"([\s|\S]*)\"/gi.exec(line);
                if(array.length == 3) {
                    const key = array[1];
                    const value = array[2];

                    translate.translate(value, language).then((translations) => {
                        output.push('"' + key + '" = "' + translations[0] + '";')
                        next();
                    });
                } else {
                    output.push(line);
                    console.error("ERROR: Ошибка при распозновании строки");
                    next();
                }
            }
        } else {
            finish();
        }
    }
    
    next();
}

function finish() {
    var dir = pth.join(__dirname, 'content', language);
    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    var file = pth.join(dir, pth.basename(filePath));
    fs.writeFileSync(file, output.join('\n'));
}
