starweb = require('../../lib/app')
helper  = require('../helper')
expect  = require('chai').expect
assert  = require('chai').assert
sinon   = require('sinon')
request = require('supertest')
starx   = require('starx')

describe('Session middleware', function(){
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
      var res = yield YRequest.get(server, '/set')
      var cookie = res.headers['set-cookie'][0]

      for (var i = 0; i < 10; i++)
        yield YRequest.get(server, '/get', {
          set    : { cookie: cookie },
          expect : 200
        })
    })(done)
  })

  // it('prevents tampering sid', function(done) {
  //   starx(function *() {    
  //     var server = app.run()
  //     yield YRequest.get(server, '/', {
  //       set    : { cookie: 'sid=whatever' },
  //       expect : 400
  //     })
  //   })(done)
  // })

  it('does not share session for different sid', function(done) {
    app.use(function *() {
      if (this.path === '/set') this.session.name = 'starweb'
      else expect(this.session.name).to.not.exist
    })

    starx(function *() {    
      var server = app.run()
      yield YRequest.get(server, '/set')

      yield YRequest.get(server, '/get', {
        set    : { cookie: 'sid=not exist' },
        expect : 200
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
      var res = yield YRequest.get(server, '/set')
      var cookie = res.headers['set-cookie'][0]

      yield YRequest.get(server, '/del', {
        set: { cookie: cookie }
      })

      yield YRequest.get(server, '/get', {
        set    : { cookie: cookie },
        expect : 200
      })
    })(done)
  })
})