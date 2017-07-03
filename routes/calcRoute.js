var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
var http = require('http');
var request = require('request');
var url = require('url');

var now = new Date();
var currentYear = now.getFullYear();   
var currentMonth = now.getMonth() +1;
var currentDay = now.getDate();
var currentHour = now.getHours();
var ascii = require('../lib/ascii');

const q = require('q');
const moment = require('moment');

router.get('/', (req, res) => q.async(function * () {
    const title = "AMoney Nowe Oblicze Finansów";
    const description = "AMoney to zaawansowany kalkulator finansowy, który opiera się na danych Narodowego Banku Polskiego. Sprawdź co oferuje.";

    let selectedDate = moment().format('YYYY-MM-DD');

    const day = selectedDate.split('-')[2];
    const month = selectedDate.split('-')[1];
    const year = selectedDate.split('-')[0];

    let nbpTable = yield getContent(`http://api.nbp.pl/api/exchangerates/tables/a/${selectedDate}`);
    
    while (nbpTable === '404 NotFound - Not Found - Brak danych') {
        selectedDate = moment(selectedDate).add(-1,'days').format('YYYY-MM-DD');
        nbpTable = yield getContent(`http://api.nbp.pl/api/exchangerates/tables/a/${selectedDate}`);
    }

    res.render('calcStartPage', {
        nbpTable: JSON.parse(nbpTable)[0].rates,
        title: title, 
        description: description,
        amount: req.query.amount,
        year: year - 2000,
        month: month,
        day: day,
        date: selectedDate,
        selected1: 'PLN',
        selected2: 'EUR'
    });
})());

router.post('/:from-na-:on--:from-ile-to-:on', (req, res) => q.async(function * () {
    const title = "Przelicznik" + " " + req.params.from + " na " + req.params.on + ". " + req.params.from + " ile to " + req.params.on;
    const description = title + " ? Sprawnie obliczysz to za pomocą kalkulatora Amoney. Obliczenia oparte o kursy NBP. Sprawdź";

    let selectedDate = `20${req.body.date}`;
    if (!moment(selectedDate, 'YYYY-MM-DD', true).isValid()) {
        selectedDate = moment().format('YYYY-MM-DD');
    }

    let selectedOnCourse = yield getContent(`http://api.nbp.pl/api/exchangerates/rates/a/${req.params.on.toLowerCase()}/${selectedDate}`);
    let selectedFromCourse = yield getContent(`http://api.nbp.pl/api/exchangerates/rates/a/${req.params.from.toLowerCase()}/${selectedDate}`);
    
    if (req.params.from !== 'PLN') {
        while (selectedFromCourse === '404 NotFound - Not Found - Brak danych') {
            selectedDate = moment(selectedDate).add(-1,'days').format('YYYY-MM-DD');
            selectedFromCourse = yield getContent(`http://api.nbp.pl/api/exchangerates/rates/a/${req.params.from.toLowerCase()}/${selectedDate}`);
        }
        selectedFromCourse = JSON.parse(selectedFromCourse).rates[0].mid;
    } else {
        selectedFromCourse = 1;
    }

    if (req.params.on !== 'PLN') {
        while (selectedOnCourse === '404 NotFound - Not Found - Brak danych') {
            selectedDate = moment(selectedDate).add(-1,'days').format('YYYY-MM-DD');
            selectedOnCourse = yield getContent(`http://api.nbp.pl/api/exchangerates/rates/a/${req.params.on.toLowerCase()}/${selectedDate}`);
        }
        selectedOnCourse = JSON.parse(selectedOnCourse).rates[0].mid;
    } else {
        selectedOnCourse = 1;
    }

    let course = selectedFromCourse * (req.body.amount || 1) / selectedOnCourse;
    res.json({ course: course.toFixed(2), date: selectedDate, title: title, description: description });
})());

router.get('/:from-na-:on--:from-ile-to-:on', (req, res) => q.async(function * () {
    const title = "Przelicznik" + " " + req.params.from + " na " + req.params.on + ". " + req.params.from + " ile to " + req.params.on;
    const description = title + " ? Sprawnie obliczysz to za pomocą kalkulatora Amoney. Obliczenia oparte o kursy NBP. Sprawdź";

    let selectedDate = moment().format('YYYY-MM-DD');

    const day = req.query.day;
    const month = req.query.month;
    const year = '20' + req.query.year;

    let nbpTable = yield getContent(`http://api.nbp.pl/api/exchangerates/tables/a/${selectedDate}`);
    
    while (nbpTable === '404 NotFound - Not Found - Brak danych') {
        selectedDate = moment(selectedDate).add(-1,'days').format('YYYY-MM-DD');
        nbpTable = yield getContent(`http://api.nbp.pl/api/exchangerates/tables/a/${selectedDate}`);
    }

    res.render('calcMain', {
        nbpTable: JSON.parse(nbpTable)[0].rates,
        title: title, 
        description: description,
        year: year - 2000,
        month: month,
        day: day,
        date: selectedDate,
        selected1: req.params.from,
        selected2: req.params.on,
        amount: req.query.amount,
        canonical: `http://amoney.pl/przelicznik/${req.params.from}-na-${req.params.on}--${req.params.from}-ile-to-${req.params.on}`
    });
})());

module.exports = router;

const getContent = function(url) {
    return new Promise((resolve, reject) => {
      const lib = url.startsWith('https') ? require('https') : require('http');
      const request = lib.get(url, (response) => {
          let body = '';
          response.on('data', (chunk) => body += chunk);
          response.on('end', () => resolve(body));
      });
      request.on('error', (err) => reject(err))
    })
};
