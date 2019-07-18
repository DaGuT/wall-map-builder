//default language is russian, but in case if we have set something else before, we extract it
let cur_lang = localStorage.getItem('language') || "ru";

//dictionary with all the words
let dictionary = {
  "en": {
    "jumboHeader": "This page is for my awesome and FREE wall map builder!",
    "jumboLead": "You can then print it and put on wall. Sadly, currently not all styles will work, but soon I will make them work. If you have any ideas/suggestions/fixes - write me somewhere :D",
    "jumboGl": "<a href='https://www.paypal.me/dagut'>Feel free to donate some money for drinks :)</a>",
    "changeLang": "Change language: ",
    "close": "Close",
    "defCity": "Tomsk",
    "defCountry": "Russia",
    "sheetSize": "What sheet size do you want?",
    "sheetOrientation": "And orientation?",
    "album": "Album",
    "landscape": "Landscape",
    "mapStyle": "Choose map style",
    "mapSub": "Write map subscription",
    "mapSubHelp": "Press Enter in 'City' field to search",
    "city": "City",
    "emptyList": "not found/loaded",
    "country": "Country",
    "coords": "Coordinates",
    "subStyle": "Map info style?",
    "subBottom": "Bottom",
    "subMini": "Mini",
    "noCaption": "No caption",
    "borderStyle": "Want some border? :)",
    "noBorder": "No border",
    "bagetue": "Bagetue",
    "whiteBorder": "White border",
    "saveMap": "Save map"
  },

  "ru": {
    "jumboHeader": "На этой странице будет постепенно развиваться и исправляться бесплатный генератор настенных красивых карт.",
    "jumboLead": "В текущий момент времени могут работать не все стили, поскольку они в процессе разработки. Если у вас есть идеи/пожелания/исправления - пишите мне, пишите куда-нибудь :)",
    "jumboGl": "<a href='https://www.paypal.me/dagut'>Всегда принимаю денюжку на еду и напитки :)</a>",
    "changeLang": "Сменить язык: ",
    "close": "Закрыть",
    "defCity": "Томск",
    "defCountry": "Россия",
    "sheetSize": "Какой размер листа хотите?",
    "sheetOrientation": "А положение страницы?",
    "album": "Альбомное",
    "landscape": "Книжное",
    "mapStyle": "Выберите стиль карты",
    "mapSub": "Введите данные для подписи",
    "mapSubHelp": "Нажмите Enter в поле ввода Города, чтобы осуществить поиск",
    "city": "Город",
    "emptyList": "нет результатов",
    "country": "Страна",
    "coords": "Координаты",
    "subStyle": "Как отображать подпись?",
    "subBottom": "Снизу",
    "subMini": "Мини",
    "noCaption": "Без подписей",
    "borderStyle": "Хотите рамку?",
    "noBorder": "Без рамки",
    "bagetue": "Багет",
    "whiteBorder": "Белая рамка",
    "saveMap": "Сохраните карту"
  }
};

let emptyListPlaceHolder = {
  "name":dictionary[cur_lang]["emptyList"],
  "lat":56.46771,
  "lng":84.97437
};

let myApp = new Vue({
  //well, what a surprise :D
  el: "#app",

  //just my translations
  data: {
    ...dictionary[cur_lang],
    citiesList: [emptyListPlaceHolder]
  }
});

//language change function
function changeLang(newLang) {
  localStorage.setItem('language', newLang);
  cur_lang = newLang;
  //replacing language strings with new ones
  Object.keys(dictionary[newLang]).forEach(key => {
    myApp[key] = dictionary[newLang][key];
  });
}
