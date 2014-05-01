require('../helper')

describe('Router middleware', function(){
  var app
  beforeEach(function() {
    app = starweb()
    app.use(app.basicAuth())
    app.use(app.router())
  })

  describe('Matching', function() {
    ['get', 'post', 'put', 'del', 'options'].forEach(function(method) {
      it('matches exact for ' + method.toUpperCase(), function(done) {
        app[method]('/api/v1/path', function *() {
          this.body = 'success'
        })
        request(app.run())
          [method]('/api/v1/path')
          .expect(200, 'success', done)
      })
    })

    it('does not match extra stuff', function(done) {
      app.get('/api/v1/path', function *() {
        this.body = 'success'
      })
      request(app.run())
        .get('/api/v1/path/more')
        .expect(404, done)
    })

    it('matches when requested path has trailing slash', function(done) {
      app.get('/api/v1/path', function *() {
        this.body = 'success'
      })
      request(app.run())
        .get('/api/v1/path/')
        .expect(200, 'success', done)
    })

    it('matches when configured path has trailing slash', function(done) {
      app.get('/api/v1/path/', function *() {
        this.body = 'success'
      })
      request(app.run())
        .get('/api/v1/path')
        .expect(200, 'success', done)
    })

    it('invokes next middleware even when matched', function(done) {
      app.get('/api/v1/path', function *() {})
      app.use(function *() {
        this.body = 'success'
      })
      request(app.run())
        .get('/api/v1/path')
        .expect(200, 'success', done)
    })

    it('matches only first route', function(done) {
      app.get('/api/v1/route', function *() {
        this.body = 'first'
      })
      app.get('/api/v1/route', function *() {
        this.body = 'second'
      })
      request(app.run())
        .get('/api/v1/route')
        .expect(200, 'first', done)
    })

    it('skips to next matched route with yield', function(done) {
      app.get('/api/v1/route', function *(next) {
        yield next
      })
      app.get('/api/v1/route', function *() {
        this.body = 'second'
      })
      request(app.run())
        .get('/api/v1/route')
        .expect(200, 'second', done)
    })

    it('does nothing if there is no other matched route', function(done) {
      app.get('/api/v1/route', function *(next) {
        yield next
      })
      request(app.run())
        .get('/api/v1/route')
        .expect(404, done)
    })

    it('automatically invokes other middleware', function(done) {
      app.get('/api/v1/route', function *() {})
      app.use(function *() {
        this.status = 200
      })
      request(app.run())
        .get('/api/v1/route')
        .expect(200, done)
    })
  })

  describe('Route params', function() {
    it('supports route params', function(done) {
      app.get('/api/v1/:name/:version', function *() {
        expect(this.params.name).to.equal('starweb')
        expect(this.params.version).to.equal('0.0.1')
        this.status = 200
      })
      request(app.run())
        .get('/api/v1/starweb/0.0.1')
        .expect(200, done)
    })

    it('sets route params differently for each matched route', function(done) {
      app.get('/api/v1/:param', function *(next) {
        expect(this.params.param).to.equal('thing')
        yield next
      })
      app.get('/api/v1/:param', function *(next) {
        expect(this.params.param).to.equal('thing')
        yield next
        this.body += ' again'
      })
      app.get('/api/v1/thing', function *() {
        expect(this.params.param).to.be.undefined
        this.body = 'success'
      })
      request(app.run())
        .get('/api/v1/thing')
        .expect(200, 'success again', done)
    })
  })

  describe('Route middleware', function() {
    var auth = function *(next, nextRoute) {
      if (this.basicAuth && this.basicAuth.username === this.basicAuth.password) {
        return yield next
      }
      yield nextRoute
    }
    
    it('runs next middleware', function(done) {
      app.get('/api/v1/admin', auth, function *() {
        this.body = 'success'
      })
      request(app.run())
        .get('/api/v1/admin')
        .auth('buunguyen', 'buunguyen')
        .expect(200, 'success', done)
    })
    
    it('runs next route', function(done) {
      app.get('/api/v1/admin', auth, function *() {})
      app.get('/api/v1/:nonadmin', function *() {
        this.body = 'success'
      })
      request(app.run())
        .get('/api/v1/admin')
        .expect(200, 'success', done)
    })
    
    it('injects the same object for next and nextRoute for the last middleware', function(done) {
      app.get('/api/v1/path', function *(next, nextRoute) {
        expect(next).to.equal(nextRoute)
        this.body = 'success'
      })
      request(app.run())
        .get('/api/v1/path')
        .expect(200, 'success', done)
    })
  })
})