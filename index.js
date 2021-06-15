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
    nextSettings(languages, () => {
        console.log("Обработка завершена");
    });
});

function nextLproj(list, callback) {
    const lang = list[0];

    if(lang != undefined) {
        list.shift();

        const langFolder = join(dir, lang + '.lproj');

        const InfoPlistSource = join(defaultLangFolder, 'InfoPlist.strings');
        const LaunchScreenSource = join(defaultLangFolder, 'LaunchScreen.strings');
        const LocalizableSource = join(defaultLangFolder, 'Localizable.strings');
        const MainSource = join(defaultLangFolder, 'Main.strings');

        const InfoPlistTarget = join(langFolder, 'InfoPlist.strings');
        const LaunchScreenTarget = join(langFolder, 'LaunchScreen.strings');
        const LocalizableTarget = join(langFolder, 'Localizable.strings');
        const MainTarget = join(langFolder, 'Main.strings');

        tr(InfoPlistSource, InfoPlistTarget, lang, () => {
            tr(LaunchScreenSource, LaunchScreenTarget, lang, () => {
                tr(LocalizableSource, LocalizableTarget, lang, () => {
                    tr(MainSource, MainTarget, lang, () => {
                        nextLproj(list, callback);
                    });
                });
            });
        });
    } else {
        callback();
    }
}

function nextSettings(list, callback) {
    const lang = list[0];
    console.log(JSON.stringify(list))

    if(lang != undefined) {
        list.shift();

        const langFolder = join(dir, 'asserts', 'Settings.bundle', lang + '.lproj');
        const defaultLangFolder = join(dir, 'asserts', 'Settings.bundle', 'ru.lproj');

        const RootSource = join(defaultLangFolder, 'Root.strings');

        const RootTarget = join(langFolder, 'Root.strings');

        tr(RootSource, RootTarget, lang, () => {
            nextSettings(list, callback);
        });
    } else {
        callback();
    }
}
