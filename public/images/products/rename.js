var fs = require('fs');

var dir = fs.readdirSync(__dirname);

dir.forEach(file => {
	fs.renameSync(__dirname + `/${file}`, __dirname + `/${file}`.replace(/ /g, "-"))
	console.log(file);
})