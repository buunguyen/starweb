helper  = require('./helper')

describe('App', function(){
  var app, spy
  beforeEach(function() {
    app = starweb()
    spy = sinon.spy()
  })

  it('can be instantiated with `new` or not', function() {
    expect(new starweb).to.be.an.instanceof(starweb)
    expect(starweb()).to.be.an.instanceof(starweb)
  })

  describe('Middleware', function() {
    it('executes middleware', function(done) {
      for (var i = 0; i < 10; i++)
        app.use(function *(next) {
          spy(TOKEN)
          yield next
        })
      request(app.run()).get('/').expect(200).end(function(err) {
        expect(spy.withArgs(TOKEN).callCount).to.equal(10)
        done(err)
      })
    })

    it('executes middleware in correct order', function(done) {
      var first = true
      app.use(function *(next) {
        if (!first) throw ERR
        first = false
        yield next
      })
      app.use(function *(next) {
        if (first) throw ERR
        yield next
      })
      request(app.run()).get('/').expect(200).end(done)
    })

    it('stops if a middleware throws', function(done) {
      app.use(function *(next) {
        spy(TOKEN)
        throw ERR
      })
      app.use(function *(next) {
        spy(TOKEN)
        yield next
      })
      request(app.run()).get('/').expect(500).end(function(err) {
        expect(spy.withArgs(TOKEN).callCount).to.equal(1)
        done(err)
      })
    })

    it('allows middleware to yield', function(done) {
      app.use(function *(next) {
        for (var i = 0; i < 10; i++) {
          var token = yield TOKEN
          spy(token)
        }
        yield next
      })
      request(app.run()).get('/').expect(200).end(function(err) {
        expect(spy.withArgs(TOKEN).callCount).to.equal(10)
        done(err)
      })
    })

    it('can yield async operation', function(done) {
      app.use(function *(next) {
        var asyncOp = function(cb) {
          setTimeout(function() {
            cb(null, TOKEN)
          }, 50)
        }
        spy(yield asyncOp)
        yield next
      })
      request(app.run()).get('/').expect(200).end(function(err) {
        expect(spy.withArgs(TOKEN).callCount).to.equal(1)
        done(err)
      })
    })

    it('supports async operation errback', function(done) {
      app.use(function *(next) {
        var badAsyncOp = function(cb) {
          setTimeout(function() {
            cb(ERR)
          }, 50)
        }
        try {
          yield badAsyncOp
        } catch (e) { spy(e) }
        yield next
      })
      request(app.run()).get('/').expect(200).end(function(err) {
        expect(spy.withArgs(ERR).callCount).to.equal(1)
        done(err)
      })
    })

    // it('also supports async operation unstructured error', function(done) {
    // // TODO: apparently, it doesn't :(, blame starx
    //   app.use(function *(next) {
    //     var badAsyncOp = function(cb) {
    //       setTimeout(function() {
    //         throw ERR
    //       }, 50)
    //     }
    //     try {
    //       yield badAsyncOp
    //     } catch (e) { spy(e) }
    //     yield next
    //   })
    //   request(app.run()).get('/').expect(200).end(function(err) {
    //     expect(spy.withArgs(ERR).callCount).to.equal(1)
    //     done(err)
    //   })
    // })
  })

  describe('Content Type', function() {
    it('supports text/plain', function(done) {
      app.use(function *(next) {
        this.body = 'text'
        yield next
      })
      request(app.run()).get('/')
        .expect(200, 'text')
        .expect('Content-Type', 'text/plain')
        .end(done)
    })

    it('supports text/html', function(done) {
      app.use(function *(next) {
        this.body = '<text>'
        yield next
      })
      request(app.run()).get('/')
        .expect(200, '<text>')
        .expect('Content-Type', 'text/html')
        .end(done)
    })

    it('supports application/json', function(done) {
      app.use(function *(next) {
        this.body = { what: 'up' }
        yield next
      })
      request(app.run()).get('/')
        .expect(200, { what: 'up' })
        .expect('Content-Type', 'application/json')
        .end(done)
    })

    it('supports buffer', function(done) {
      app.use(function *(next) {
        this.body = new Buffer('text')
        yield next
      })
      request(app.run()).get('/')
        .expect(200, 'text')
        .expect('Content-Type', 'application/octet-stream')
        .end(done)
    })

    it('supports streaming', function(done) {
      app.use(function *(next) {
        this.body = fs.createReadStream(__filename) 
        yield next
      })
      request(app.run()).get('/')
        .expect(200)
        .expect('Transfer-Encoding', 'chunked')
        .end(done)
    })

    it('supports custom content type', function(done) {
      app.use(function *(next) {
        this.body = 'text'
        this.type = 'my/mime'
        yield next
      })
      request(app.run()).get('/')
        .expect(200, 'text')
        .expect('Content-Type', 'my/mime')
        .end(done)
    })
  })

})