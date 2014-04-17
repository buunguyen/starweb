starweb = require('../lib/app')
expect  = require('chai').expect
assert  = require('chai').assert
sinon   = require('sinon')
request = require('supertest')

describe('context', function(){
  var app, spy
  beforeEach(function() {
    spy = sinon.spy()
    app = starweb()
    app.use(app.cookies())
    app.error(function(err) {
      console.log(err)
    })
  })

  describe('cookie', function(done) {
    it('sets cookie', function(done) {
      app.use(function *() {
        this.cookie('name', 'some value')
      })
      request(app.run())
        .get('/')
        .expect('set-cookie', 'name=some value; Path=/', done)
    })

    // opts: { path: ..., domain: ..., expires: ...,  maxAge: ..., httpOnly: ..., secure: ... }
    it('sets cookie with options', function(done) {
      app.use(function *() {
        this.cookie('name', 'value', { 
          path: '/static', 
          domain: '.foo.com',
          expires: 'some time',
          maxAge: 1000,
          httpOnly: true, 
          secure: true 
        })
      })
      request(app.run())
        .get('/')
        .expect('set-cookie', 'name=value; Path=/static; Domain=.foo.com; Expires=some time; Max-Age=1000; HttpOnly; Secure', done)
    })
    
    it('sets cookie and parses expires as milliseconds', function(done) {
      app.use(function *() {
        this.cookie('name', 'value', {
          expires: Date.UTC(2014, 3, 15)
        })
      })
      request(app.run())
        .get('/')
        .expect('set-cookie', 'name=value; Path=/; Expires=Tue, 15 Apr 2014 00:00:00 GMT', done)
    })

    it('sets cookie and parses expires as date object', function(done) {
      app.use(function *() {
        this.cookie('name', 'value', {
          expires: new Date(Date.UTC(2014, 3, 15))
        })
      })
      request(app.run())
        .get('/')
        .expect('set-cookie', 'name=value; Path=/; Expires=Tue, 15 Apr 2014 00:00:00 GMT', done)
    })

    it('sets JSON cookie', function(done) {
      app.use(function *() {
        this.cookie('lang', {
          name: 'js',
          version: '1.7' 
        })
      })
      request(app.run())
        .get('/')
        .expect('set-cookie', 'lang={"name":"js","version":"1.7"}; Path=/', done)
    })
  })
})