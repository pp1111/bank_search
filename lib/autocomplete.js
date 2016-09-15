var mongo = require('mongodb');

var Server = mongo.Server,
        Db = mongo.Db,
        BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('products', server);

db.open(function(err, db) {
    if (!err) {
        console.log("Connected to 'products' database");
        db.collection('productsList', {strict: false}, function(err, collection) {
            if (err) {
                console.log("error collection"+err);
            }
        });
    }
});


exports.find = function(req, res) {
var b=req.params.search;
db.collection('productsList', (err, collection) => {
    collection.find({name: new RegExp(b,'i')}).limit(5).toArray( (err, items) => {
            res.jsonp(items);
        });
    });
};