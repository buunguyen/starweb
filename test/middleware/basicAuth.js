require('../helper')

describe('Basic authentication middleware', function(){
  var app

  beforeEach(function() {
    app = starweb()
    app.use(app.basicAuth())
    app.on('error', function(err) {
      console.error(err)
    })
  })

  it('does not populate basicAuth if Authorization header does not exist', function(done) {
    app.use(function *() {
      expect(this.basicAuth).to.be.undefined
      this.status = 204
    })
    request(app.run())
      .get('/')
      .expect(204, done)
  })

  it('populates basicAuth if Authorization exists', function(done) {
    app.use(function *() {
      expect(this.basicAuth.username).to.equal('buunguyen')
      expect(this.basicAuth.password).to.equal('buunguyen')
      this.status = 204
    })
    request(app.run())
      .get('/')
      .auth('buunguyen', 'buunguyen')
      .expect(204, done)
  })

  it('populates basicAuth if only user name is provided', function(done) {
    app.use(function *() {
      expect(this.basicAuth.username).to.equal('buunguyen')
      expect(this.basicAuth.password).to.be.undefined
      this.status = 204
    })
    request(app.run())
      .get('/')
      .auth('buunguyen')
      .expect(204, done)
  })

  it('ignores non-basic Authorization header', function(done) {
    request(app.run())
      .get('/')
      .set('Authorization', 'Bearer whatever')
      .expect(404, done)
  })

  it('throws on invalid Authorization header', function(done) {
    request(app.run())
      .get('/')
      .set('Authorization', 'Basic')
      .expect(400, done)
  })
})