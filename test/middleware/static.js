require('../helper')

describe('Static middleware', function(){
  var app
  beforeEach(function() {
    app = starweb()
    app.use(app.logger())
  })

  it('serves from \'public\' by default', function(done) {
    app.use(app.static())
    request(app.run())
      .get('/test/middleware/static.js')
      .expect(404)
      .end(done)
  })

  it('falls through if not found', function(done) {
    app.use(app.static())
    app.use(function *() {
      this.body = 'text'
    })
    request(app.run())
      .get('/test/middleware/static.js')
      .expect(200)
      .end(done)
  })

  it('overrides default root', function(done) {
    app.use(app.static('./'))
    request(app.run())
      .get('/test/middleware/static.js')
      .expect(200)
      .expect('Content-Type', 'application/javascript')
      .end(done)
  })

  it('tries \'index.html\' if directory', function(done) {
    app.use(app.static('./'))
    request(app.run())
      .get('/test/middleware/')
      .expect(200)
      .expect('Content-Type', 'text/html')
      .end(function(err) {
        if (err) return done(err)
        request(app.run())
          .get('/test/middleware')
          .expect(200)
          .expect('Content-Type', 'text/html')
          .end(done)
      })
  })
})