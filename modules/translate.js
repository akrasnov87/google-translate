// https://medium.com/analytics-vidhya/how-to-use-google-cloud-translation-api-with-nodejs-6bdccc0c2218

/*
https://github.com/justinklemm/i18n-strings-files
*/
const pth = require('path');
const join = pth.join;

process.env.GOOGLE_APPLICATION_CREDENTIALS = join(__dirname, '../', 'mobile-walker-72293ee4ca27.json');
const fs = require('fs')
const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate();

module.exports = function(ignoreFile, fromFile, toFile, targetLang, callback) {
    var output = [];
    var comment = false;

    var ignore = readIgnore(ignoreFile);

    if (fs.existsSync(fromFile)) {
    
        var content = fs.readFileSync(fromFile).toString();
        var lines = content.split('\n');
    
        function next() {
            var line = lines[0];
            if (line != undefined) {
                lines.shift();

                if (line.startsWith('/*') && line.endsWith('*/')) {
                    output.push(line);
                    return next();
                }
    
                if (comment == true && line.endsWith('*/')) {
                    comment = false;
                    output.push(line);
                    return next();
                }

                if (comment == true) {
                    output.push(line);
                    return next();
                }

                if (line.startsWith('/*')) {
                    comment = true;
                    output.push(line);
                    return next();
                }

                if(line == '' || line.startsWith('/*')) {
                    output.push(line);
                    next();
                } else {
                    var array = /\"([\s|\S]*)\"\s*=\s*\"([\s|\S]*)\"/gi.exec(line);
                    if (array == undefined) {
                        return next();
                    }
                    if(array.length == 3) {
                        const key = array[1];
                        const value = array[2];

                        if (ignore[targetLang] && ignore[targetLang][key] != undefined) {
                            output.push('"' + key + '" = "' + ignore[targetLang][key] + '";')
                            return next();
                        }
    
                        translate.translate(value, targetLang).then((translations) => {
                            output.push('"' + key + '" = "' + translations[0].replace(/% @/gi, '%@').replace(/ %@/gi, '%@').replace(/%@/gi, ' %@') + '";')
                            next();
                        });
                    } else {
                        output.push(line);
                        console.error("ERROR: Ошибка при распозновании строки");
                        next();
                    }
                }
            } else {
                if(!fs.existsSync(toFile)) {
                    fs.unlinkSync(toFile);
                }
            
                fs.writeFileSync(toFile, output.join('\n'));
                console.log(toFile)
                callback();
            }
        }
        
        next();
    } else {
        callback();
    }
}

function readIgnore(file) {
    if (fs.existsSync(file)) {
        var result = {};
        var str = fs.readFileSync(file).toString();
        var data = str.split('\n');
        for (var i in data) {
            var item = data[i];
            var array = item.split(' = ');
            if (array.length == 3) {
                if (result[array[0]] == undefined) {
                    result[array[0]] = {};
                }

                result[array[0]][array[1]] = array[2];
            }
        }

        return result;
    }

    return {};
}