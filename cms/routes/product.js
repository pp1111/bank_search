var mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectID
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('products', server);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'products database");
        db.collection('productsList', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'products' collection doesn't exist. Creating it with sample data...");
            }
        });
    }
});

exports.findById = function(req, res) {
    var id = new ObjectId(req.params.id);
    console.log('Retrieving product: ' + id);
    db.collection('productsList', function(err, collection) {
        collection.findOne({'_id':id}, function(err, item) {
            res.send(JSON.stringify(item,false,4));
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('productsList', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(JSON.stringify(items,false,4));
        });
    });
};

exports.addproduct = function(req, res) {
    var product = req.body;
    console.log('Adding product: ' + JSON.stringify(product));
    db.collection('productsList', function(err, collection) {
        collection.insert(product, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.updateproduct = function(req, res) {
    var id = new ObjectId(req.params.id);
    var product = req.body;
    delete product._id;
    console.log('Updating product: ' + id);
    db.collection('productsList', function(err, collection) {
        collection.update({'_id':id}, product , function(err, result) {
            if (err) {
                console.log('Error updating product: ' + err);
                res.send(500,{'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(product);
            }
        });
    });
}

exports.deleteproduct = function(req, res) {
    var id = new ObjectId(req.params.id);
    console.log('Deleting product: ' + id);
    db.collection('productsList', function(err, collection) {
        collection.remove({'_id':id}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

exports.findSubcategory = function(req, res) {
    var id = new ObjectId(req.params.id);
    console.log('Retrieving product: ' + id);
    db.collection('subcategories', function(err, collection) {
        collection.findOne({'_id':id}, function(err, item) {
            res.send(JSON.stringify(item,false,4));
        });
    });
};

exports.findAllSubcategories = function(req, res) {
    db.collection('subcategories', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(JSON.stringify(items,false,4));
        });
    });
};

exports.addSubcategory = function(req, res) {
    var subcategory = req.body;
    console.log('Adding subcategory: ' + JSON.stringify(subcategory));
    db.collection('subcategories', function(err, collection) {
        collection.insert(subcategory, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.updateSubcategory = function(req, res) {
    var id = new ObjectId(req.params.id);
    var subcategory = req.body;
    delete subcategory._id;
    console.log('Updating subcategory: ' + id);
    db.collection('subcategories', function(err, collection) {
        collection.update({'_id':id}, subcategory , function(err, result) {
            if (err) {
                console.log('Error updating subcategory: ' + err);
                res.send(500,{'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(subcategory);
            }
        });
    });
}