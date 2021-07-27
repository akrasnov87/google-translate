// https://medium.com/analytics-vidhya/how-to-use-google-cloud-translation-api-with-nodejs-6bdccc0c2218

/*
https://github.com/justinklemm/i18n-strings-files
*/
const pth = require('path');
const join = pth.join;

process.env.GOOGLE_APPLICATION_CREDENTIALS = join(__dirname, 'mobile-walker-72293ee4ca27.json');
var args = process.argv.slice(2);
const fs = require('fs')
const tr = require('./modules/translate');

// список языков для обработки. По умолчанию ru
var languages = args[0].split(',');
// директория для вывода результата
const dir = args[1]
// папка для хранения локализации по умолчанию
const defaultLangFolder = join(dir, 'ru.lproj');

nextLproj(languages, () => {
    languages = args[0].split(',');
    nextViews(languages, () => {
        console.log("Обработка завершена");
    });
});

function nextLproj(list, callback) {
    const lang = list[0];

    if(lang != undefined) {
        list.shift();

        const langFolder = join(dir, lang + '.lproj');

        const InfoPlistSource = join(defaultLangFolder, 'InfoPlist.strings');
        const LocalizableSource = join(defaultLangFolder, 'Localizable.strings');
        const MainSource = join(defaultLangFolder, 'Main.strings');

        const InfoPlistTarget = join(langFolder, 'InfoPlist.strings');
        const LocalizableTarget = join(langFolder, 'Localizable.strings');
        const MainTarget = join(langFolder, 'Main.strings');

        tr(InfoPlistSource, InfoPlistTarget, lang, () => {
            tr(MainSource, MainTarget, lang, () => {
                tr(LocalizableSource, LocalizableTarget, lang, () => {
                    nextLproj(list, callback);
                });
            });
        });
    } else {
        callback();
    }
}

/**
 * Поиск по всему приложению. Рекурсивно
 * @param {string[]} list лакализации для перевода
 * @param {function} callback 
 */
function nextViews(list, callback) {
    // нужно найти все папки в которых есть локализации для перевода
    var findFolder = []
    function find(folder) {
        var results = fs.readdirSync(folder);
        for(var i in results) {
            if(results[i] == 'ru.lproj') {
                // каталог для перевода найден
                findFolder.push(folder);
            }
            if (fs.statSync(join(folder, results[i])).isDirectory()) {
                find(join(folder, results[i]));
            }
        }
    }

    var dirs = fs.readdirSync(dir);
    for(var i in dirs) {
        if (fs.statSync(join(dir, dirs[i])).isDirectory()) {
            find(join(dir, dirs[i]))
        }
    }

    const lang = list[0];
    console.log(JSON.stringify(list))

    function nextFiles(files, folder, fileCallback) {
        const file = files[0]

        if (file != undefined) {
            files.shift();

            const langFolder = join(folder, lang + '.lproj');
            const defaultLangFolder = join(folder, 'ru.lproj');

            const source = join(defaultLangFolder, file);
            const target = join(langFolder, file);
    
            tr(source, target, lang, () => {
                nextFiles(files, folder, fileCallback);
            });
        } else {
            fileCallback();
        }
    }

    function nextFolder(folderCallback) {
        const folder = findFolder[0]

        if (folder != undefined) {
            findFolder.shift();

            const defaultLangFolder = join(folder, 'ru.lproj');

            var files = fs.readdirSync(defaultLangFolder);
            
            nextFiles(files, folder, () => {
                nextFolder(folderCallback);
            });
        } else {
            folderCallback();
        }
    }

    if(lang != undefined) {
        list.shift();

        nextFolder(() => {
            nextViews(list, callback);
        });
    } else {
        callback();
    }
}
