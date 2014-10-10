'use strict';

process.env.NODE_ENV = 'testing';
// NODE_ENV=testing ./node_modules/.bin/knex migrate:latest

var _ = require('lodash');
var expect = require('chai').expect;
var request = require('request');
var util = require('util');
var server = require('../server');
var app = server.app;
var knex = server.knex;
var Doctor = server.Doctor;
var server;
var port = 38239;
var baseURL = util.format('http://localhost:%d', port);


describe('api', function() {

  before(function(done) {
    server = app.listen(port, done);
  });

  after(function(done) {
    server.close(done);
  });
//two test one for doctors one for patients 
  beforeEach(function(done) {
    knex('doctors').delete().then(function() { done(); }, done);
    knex('patients').delete().then(function(){ done(); }, done);
  });

  it.skip('handles POST /api/doctors', function(done) {
    var data = {
      name: 'Whitney Young',
      specialty: 'Proctologist',
    };
    request.post(baseURL + '/api/doctors', { form: data }, function(err, response, body) {
      Doctor.fetchAll().then(function(doctors) {
        var bodyObject = JSON.parse(body);
        delete bodyObject.doctor.id;
        var doctorsWithoutIds = doctors.toJSON().map(function(doc) {
          return _.omit(person, 'id');
        });
        expect(bodyObject).to.eql({
          person: {
            name: 'Whitney Young',
            specialty: 'Proctologist',
          }
        })
        expect(doctorsWithoutIds).to.eql([{
          name: 'Whitney Young',
          specialty: 'Proctologist',
        }]);
        done();
      });
    });
  });

  it.skip('rejects POST /api/people when there is too much info', function(done) {
    var data = {
      firstName: 'Whitney',
      lastName: 'Young',
      address: 'Chicago',
      puppies: '12 of them'
    };
    request.post(baseURL + '/api/doctors', { form: data }, function(err, response, body) {
      var bodyObject = JSON.parse(body);
      expect(bodyObject).to.eql({ error: 'Invalid request. Properties don\'t match allowed values.' });
      expect(response.statusCode).to.eql(400);
      Person.fetchAll().then(function(people) {
        expect(doctors.toJSON()).to.eql([]);
        done();
      });
    });
  });

});
