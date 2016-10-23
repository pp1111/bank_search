var iconv = require('iconv');

function toUTF8(body) {
    var ic = new iconv.Iconv('iso-8859-1', 'utf-8');
    var buf = ic.convert(body);

    return buf.toString('utf-8');
}

function asciiOff(body) {
    // convert from iso-8859-1 to utf-8
    var ic = new iconv.Iconv('UTF-8', 'ASCII//TRANSLIT');
    var buf = ic.convert(body);

    buf = buf.toString().replace(/'/g,"");
    return buf.toString('utf-8');
}

module.exports = {
	toUTF8: toUTF8,
	asciiOff: asciiOff
}
