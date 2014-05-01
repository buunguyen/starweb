require('../helper')

describe('Router middleware', function(){
  var app, router
  beforeEach(function() {
    app = starweb()
    app.use(router = app.router())
  })

  it('matches exact', function(done) {
    app.get('/api/v1/path', function *() {
      this.body = 'success'
    })
    request(app.run())
      .get('/api/v1/path')
      .expect(200, 'success', done)
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

  it('matches first route', function(done) {
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

  // it('allows a match to invoke the next match', function(done) {
  //   app.get('/api/v1/:param', function *(next) {
  //     expect(this.params.param).to.equal('thing')
  //     yield next
  //   })
  //   app.get('/api/v1/thing', function *() {
  //     expect(this.params.param).to.be.null
  //     this.body = 'success'
  //   })
  //   request(app.run())
  //     .get('/api/v1/thing')
  //     .expect(200, 'success', done)
  // })

})