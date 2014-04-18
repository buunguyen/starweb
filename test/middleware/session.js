starweb = require('../../lib/app')
expect  = require('chai').expect
assert  = require('chai').assert
sinon   = require('sinon')
request = require('supertest')

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
    var first = true
    app.use(function *() {
      if (first) {
        this.session.name = 'starweb'
        first = false
      } else {
        expect(this.session.name).to.equal('starweb')
      }
    })
    var server = app.run()
    request(server)
      .get('/')
      .end(function(err, res) {
        request(server)
          .get('/')
          .set('cookie', res.headers['set-cookie'])
          .expect(200, done)
      })
  })
})