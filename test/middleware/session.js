starweb = require('../../lib/app')
helper  = require('../helper')
expect  = require('chai').expect
assert  = require('chai').assert
sinon   = require('sinon')
request = require('supertest')
starx   = require('starx')

describe('session middleware', function(){
  var app

  beforeEach(function() {
    app = starweb()
    app.use(app.cookies())
    app.use(app.session())
    app.error(function(err) {
      console.log(err.stack)
    })
  })

  it('throws error if cookie middleware is not used', function(done) {
    var _app = starweb()
    _app.use(_app.session())
    request(_app.run())
      .get('/')
      .expect(500, done)
  })

  it('does not throw if cookie middleware is used', function(done) {
    request(app.run())
      .get('/')
      .expect(200, done)
  })

  it('persists session for multiple request', function(done) {
    app.use(function *() {
      if (this.path === '/set') this.session.name = 'starweb'
      else expect(this.session.name).to.equal('starweb')
    })

    starx(function *() {    
      var server = app.run()
      var res = yield _req(server, '/set')
      var cookie = res.headers['set-cookie'][0]

      yield _req(server, '/get', {
        sets: { cookie: cookie },
        expects: 200
      })
    })(done)
  })

  it('does not share session for different sid', function(done) {
    app.use(function *() {
      if (this.path === '/set') this.session.name = 'starweb'
      else expect(this.session.name).to.not.exist
    })

    starx(function *() {    
      var server = app.run()
      yield _req(server, '/set')
      
      yield _req(server, '/get', {
        sets: { cookie: 'sid=not exist' },
        expects: 200
      })
    })(done)
  })

  it('destroys session', function(done) {
    app.use(function *() {
      if (this.path === '/set') this.session.name = 'starweb'
      else if (this.path === '/del') this.session.destroy()
      else expect(this.session.name).to.not.exist
    })

    starx(function *() {    
      var server = app.run()
      var res = yield _req(server, '/set')
      var cookie = res.headers['set-cookie'][0]

      yield _req(server, '/del', {
        sets: { cookie: cookie }
      })

      yield _req(server, '/get', {
        sets: { cookie: cookie },
        expects: 200
      })
    })(done)
  })
})