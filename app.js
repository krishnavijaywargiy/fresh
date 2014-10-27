
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var book = require('./routes/book');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

if(env === 'development') {
  var db_url = "mongodb://krishna:gameloft@linus.mongohq.com:10038/app31039409";
    mongoose.connect(db_url);
}
else {
  var db_url = "mongodb://krishna:gameloft@linus.mongohq.com:10038/app31039409";
  mongoose.connect(db_url);
}
//Defining Schema
mongoose.connect(db_url);
var BookSchema = new mongoose.Schema({
    title: String,
    description: String,
    author: String
});
var Books = mongoose.model('Books', BookSchema);


app.get('/', routes.index);
app.get('/books', function(req, res) {
    Books.find({}, function(err, docs) {
        res.render('books', {books: docs});
    });
});

app.get('/books/new', function(req, res) {
    res.render('books/new');
});

app.post('/books', function(req, res) {
    var b = req.body;
    new Books({
        title: b.title,
        description: b.description,
        author: b.author
    }).save(function(err, book) {
            if(err) res.json(err);
            res.redirect('/books/' + book.title);
        })
});

app.param('title', function(req, res, next, title) {
    Books.find({title:title}, function(err, docs) {
        req.book = docs[0];
        next();
    });
});
//SHOW
app.get('/books/:title', function(req, res) {
    res.render('books/show', {book:req.book});
});

//EDIT
app.get('/books/:title/edit', function(req, res){
    res.render('books/edit', { book:req.book});
});

//UPDATE
app.put('/books/:title', function(req, res) {
    var b = req.body;
        Books.update(
        { title: req.params.title },
        {title: b.title, description: b.description, author: b.author},
            function(err) {
                res.redirect('/books/' + b.title);
            }
    )
});

//DELETE
app.delete('/books/:title', function(req, res) {
    Books.remove({title:req.params.title}, function(err) {
        res.redirect('/books');
    })
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
