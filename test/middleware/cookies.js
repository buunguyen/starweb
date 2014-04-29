require('../helper')

describe('Cookies middleware', function(){
  var app
  beforeEach(function() {
    app = starweb()
    app.use(app.cookies())
    app.use(function *(next) {
      this.status = 200
      yield next
    })
    app.on('error', function(err) {
      console.log(err.stack)
    })
  })

  it('creates cookies object even when there is no cookie header', function(done) {
    app.use(function *() {
      expect(this.cookies).to.exist
    })
    request(app.run())
      .get('/')
      .expect(200, done)
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

  describe('Signing', function() {
    var app
    beforeEach(function() {
      app = starweb()
      app.use(function *(next) {
        this.status = 200
        yield next
      })
      app.use(app.cookies('secret'))
    })

    it('parses signed cookie', function(done) {
      app.use(function *() {
        if (this.path === '/set') this.cookie('name', 'some value', { sign: true } )
        else expect(this.signedCookies.name).to.equal('some value')
      })
      starx(function *() {
        var server = app.run()
        var res = yield YRequest.get(server, '/set')
        var cookie = res.headers['set-cookie'][0]
        yield YRequest.get(server, '/', {
          set: { cookie: cookie },
          expect: 200
        })
      })(done)
    })

    it('throws on attempt to tamper value or signature', function(done) {
      app.use(function *() {
        this.cookie('name', 'some value', { sign: true } )
      })
      starx(function *() {
        var server = app.run()
        var res = yield YRequest.get(server, '/')
        var cookie = res.headers['set-cookie'][0]

        yield YRequest.get(server, '/', {
          set: { cookie: 'name=s:modified value.85OgNllnamzw6UN5OQoijneayzmaD/TZP2dDSUk8erg' },
          expect: 400
        })

        yield YRequest.get(server, '/', {
          set: { cookie: 'name=s:some value.modified signature' },
          expect: 400
        })
      })(done)
    })

  })
})