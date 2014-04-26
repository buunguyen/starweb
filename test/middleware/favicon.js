require('../helper')

describe('Favicon middleware', function(){
  var app
  beforeEach(function() {
    app = starweb()
    app.on('error', function(err) {
      console.log(err.stack)
    })
  })

  it('serves default favicon', function(done) {
    app.use(app.favicon())
    request(app.run())
      .get('/favicon.ico')
      .expect(200)
      .expect('Content-Type', 'image/x-icon')
      .end(done)
  })

  it('ignores non-favicon request', function(done) {
    app.use(app.favicon())
    app.use(function *(next) {
      this.body = 'whatever'
      yield next
    })
    request(app.run())
      .get('/notfavicon')
      .expect(200, 'whatever')
      .expect('Content-Type', 'text/plain')
      .end(done)
  })

  it('serves custom favicon', function(done) {
    app.use(app.favicon('notexist'))
    request(app.run())
      .get('/favicon.ico')
      .expect(404)
      .end(done)
  })
})