exports = module.exports = basicAuth

function basicAuth() {
  return function *(next) {
    var header = this.reqHeaders['authorization']
    if (!header || header.indexOf('Basic') !== 0) return yield next

    try {
      var token    = header.split(/\s+/)[1]
        , auth     = new Buffer(token, 'base64').toString()
        , parts    = auth.split(/:/)
        
      this.basicAuth = {
        username: parts[0],
        password: parts[1]
      }
    } catch (e) {
      this.throw(400, e)
    }

    yield next
  }
}