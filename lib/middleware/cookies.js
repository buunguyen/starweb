exports = module.exports = cookies

function cookies() {
  return function *(next) {
    if (!this.cookies) {
      this.cookies = {}
      var cookieString = this.req.headers.cookie
      cookieString && cookieString.split(';').forEach(function(cookie) {
        var parts = cookie.split('='),
            name = parts[0].trim(),
            val = parts[1].trim()
        try {
          val = JSON.parse(val)
        } catch(e) {}
        this.cookies[name] = val
      }.bind(this))
    }
    yield next
  }
}