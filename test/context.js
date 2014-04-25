require('./helper')

describe('Context', function(){
  var app, spy, ERR = new Error()

  beforeEach(function() {
    app = starweb()
    app.use(app.cookies())
    spy = sinon.spy()
  })

  it('notifies when done once', function(done) {
    app.use(function *() {
      this.on('done', spy)
    })
    request(app.run()).get('/').expect(200).end(function(err) {
      expect(spy.callCount).to.equal(1)
      done(err)
    })
  })

  it('notifies when done with error', function(done) {
    app.use(function *(next) {
      this.on('done', spy)
      yield next
    })
    app.use(function *() {
      throw ERR
    })
    request(app.run()).get('/').expect(500).end(function(err) {
      expect(spy.withArgs(ERR).callCount).to.equal(1)
      done(err)
    })
  })

  it('fires application error when done with error', function(done) {
    app.on('error', spy) 
    app.use(function *() {
      throw ERR
    })   
    request(app.run()).get('/').expect(500).end(function(err) {
      expect(spy.withArgs(ERR).callCount).to.equal(1)
      done(err)
    })
  })

  it('ends request with error on throw', function(done) {
    app.on('error', spy) 
    app.use(function *() {
      this.throw(400, ERR);
    })   
    request(app.run()).get('/').expect(400).end(function(err) {
      expect(spy.withArgs(ERR).callCount).to.equal(1)
      done(err)
    })
  })

  describe('Cookie', function(done) {
    it('sets cookie', function(done) {
      app.use(function *() {
        this.cookie('name', 'some value')
      })
      request(app.run())
        .get('/')
        .expect('set-cookie', 'name=some value; Path=/', done)
    })

    it('sets cookie with options', function(done) {
      app.use(function *() {
        this.cookie('name', 'value', { 
          path: '/static', 
          domain: '.foo.com',
          expires: 'some time',
          maxAge: 1000,
          httpOnly: true, 
          secure: true 
        })
      })
      request(app.run())
        .get('/')
        .expect('set-cookie', 'name=value; Path=/static; Domain=.foo.com; Expires=some time; Max-Age=1000; HttpOnly; Secure', done)
    })
    
    it('sets cookie and parses expires as milliseconds', function(done) {
      app.use(function *() {
        this.cookie('name', 'value', {
          expires: Date.UTC(2014, 3, 15)
        })
      })
      request(app.run())
        .get('/')
        .expect('set-cookie', 'name=value; Path=/; Expires=Tue, 15 Apr 2014 00:00:00 GMT', done)
    })

    it('sets cookie and parses expires as date object', function(done) {
      app.use(function *() {
        this.cookie('name', 'value', {
          expires: new Date(Date.UTC(2014, 3, 15))
        })
      })
      request(app.run())
        .get('/')
        .expect('set-cookie', 'name=value; Path=/; Expires=Tue, 15 Apr 2014 00:00:00 GMT', done)
    })

    it('sets JSON cookie', function(done) {
      app.use(function *() {
        this.cookie('lang', {
          name: 'js',
          version: '1.7' 
        })
      })
      request(app.run())
        .get('/')
        .expect('set-cookie', 'lang={"name":"js","version":"1.7"}; Path=/', done)
    })

    describe('Signing', function(done) {
      beforeEach(function() {
        app = starweb()
        app.use(app.cookies('secret'))
        app.on('error', function(err) {
          console.log(err.stack)
        })
      })

      it('signs cookie', function(done) {
        app.use(function *() {
          this.cookie('name', 'some value', { sign: true } )
        })
        request(app.run())
          .get('/')
          .expect('set-cookie', 'name=s:some value.85OgNllnamzw6UN5OQoijneayzmaD/TZP2dDSUk8erg; Path=/', done)
      })

      it('signs JSON cookie', function(done) {
        app.use(function *() {
          this.cookie('lang', { name: 'js', version: '1.7' }, { sign: true } )
        })
        request(app.run())
          .get('/')
          .expect('set-cookie', 'lang=s:{"name":"js","version":"1.7"}.Hd1FF7rwvh3HoStR6vTiFIV4/SKSEk9kbD+Ti+SWZ4Q; Path=/', done)
      })
    })
  })
})