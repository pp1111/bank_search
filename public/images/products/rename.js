var fs = require('fs');

var dir = fs.readdirSync(__dirname);

dir.forEach(file => {
	fs.renameSync(__dirname + `/${file}`, __dirname + `/${file}`.replace(/ /g, "-").replace(/ż/g, 'ż').replace(/ó/g, 'ó'));
	console.log(file);
})
