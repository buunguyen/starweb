exports = module.exports = cookies

function cookies() {
  return function *(next) {
    if (!this.cookies) {
      this.cookies = this.cookies || {}
      var cookieString = this.req.headers.cookie
      cookieString && cookieString.split(';').forEach(function(cookie) {
        var parts = cookie.split('=')
        this.cookies[parts[0].trim()] = (parts[1] || '').trim()
      }.bind(this))
    }
    yield next
  }
}