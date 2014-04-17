starweb = require('../../lib/app')
expect  = require('chai').expect
assert  = require('chai').assert
sinon   = require('sinon')
request = require('supertest')

describe('cookies middleware', function(){
  var app, spy
  beforeEach(function() {
    spy = sinon.spy()
    app = starweb()
    app.use(app.cookies())
    app.error(function(err) {
      console.log(err)
    })
  })

  it('creates cookies object even when there is no cookie header', function(done) {
    app.use(function *() {
      expect(this.cookies).to.exist
      this.status = 204
    })
    request(app.run())
      .get('/')
      .expect(204, done)
  })

  it('populates cookies object based on cookie header', function(done) {
    app.use(function *() {
      expect(this.cookies.name).to.equal('value')
      expect(this.cookies.name2).to.equal('value with space')
      this.status = 204
    })
    request(app.run())
      .get('/')
      .set('cookie', 'name=value; name2  = value with space ')
      .expect(204, done)
  })

  it('populates cookies object from JSON', function(done) {
    app.use(function *() {
      expect(this.cookies.lang.name).to.equal('js')
      expect(this.cookies.lang.version).to.equal(1.7)
      expect(this.cookies.framework.name).to.equal('starweb')
      this.status = 204
    })
    request(app.run())
      .get('/')
      .set('cookie', 'lang={"name": "js","version": 1.7}; framework={"name": "starweb"}')
      .expect(204, done)
  })
})