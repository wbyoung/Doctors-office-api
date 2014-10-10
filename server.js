var _ = require('lodash');
var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');

// note: not such a good way to make this work.
if (require.main === module) {
  app.use(require('morgan')('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

var env = process.env.NODE_ENV || 'development';
var knexConfig = require('./knexfile.js')[env];
var knex = require('knex')(knexConfig);
var bookshelf = require('bookshelf')(knex);

var Doctor = bookshelf.Model.extend({
  tableName: 'doctors'
});

var id = 1;
var doctors = {};

app.get('/', function(req, res) {
  res.redirect('/home/');
});

app.get('/api/doctors', function(req, res) {
  res.json({ doctors: _.values(doctors) });
});


// url: http://localhost:8000/api/doctors?firstName=lamp&lastName=love&address=portland
// returns: {"doctors": []}
app.post('/api/doctors', function(req, res) {

  var paramsValid = _(req.body)
    .keys()
    .without('name', 'specialty')
    .size() === 0;

  if (paramsValid) {
    Doctor.forge(req.body).save().then(function(doc) {
      res.json({ doc: doc });
    })
    .catch(function(error) {
      res.status(500);
      res.json({ error: 'Unhandled exception' });
    })
    .done();
  }
  else {
    res.status(400);
    res.json({ error: 'Invalid request. Properties don\'t match allowed values.' });
  }
});

app.put('/api/doctors/:id', function(req, res) {
  var doc = doctors[req.params.id];
  if (doc) {
    doc = _.pick(req.body, 'name', 'specialty');
    doc.id = req.params.id;
    doctors[doc.id] = doc;
  };
  res.json({ doc: doc });
});

app.delete('/api/doctors/:id', function(req, res) {
  var doc = doctors[req.params.id];
  if (doc) {
    delete doctors[doc.id];
  }
  res.json({ doc: doc });
});

// curl -X GET http://localhost:8000/api/doctors
// curl -X POST --data "firstName=Whitney&lastName=Young&address=Chicago" http://localhost:8000/api/doctors
// curl -X GET http://localhost:8000/api/doctors
// curl -X PUT --data "firstName=Whitney&lastName=Young&address=Portland" http://localhost:8000/api/doctors/1
// curl -X GET http://localhost:8000/api/doctors
// curl -X DELETE http://localhost:8000/api/doctors/1
// curl -X GET http://localhost:8000/api/doctors
// curl -X PUT --data "firstName=Whitney&lastName=Young&address=Nowhere" http://localhost:8000/api/doctors/1
// curl -X DELETE http://localhost:8000/api/doctors/1


module.exports = {
  app: app,
  knex: knex,
  bookshelf: bookshelf,
  Doctor: Doctor
};

// if this was done via the command line & not required from another file
if (require.main === module) {
  var server = app.listen(process.env.PORT || 8000, function() {
    console.log('Listening on port %d', server.address().port);
  });
}

