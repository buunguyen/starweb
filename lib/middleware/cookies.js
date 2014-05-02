var crypto = require('crypto')

exports = module.exports = cookies

function cookies(secret) {
  return function *(next) {
    if (!this.cookies) {
      this.secret = secret
      this.cookies = {}
      this.signedCookies = {}

      try {
        var cookieString = this.reqHeaders.cookie
        cookieString && cookieString.split(';').forEach(function(cookie) {
          var parts = cookie.split('='),
              name  = parts[0].trim(),
              val   = parts[1].trim()
          if (secret && val.indexOf(exports.prefix) === 0) {
            var decodedVal = exports.unsign(val.substring(exports.prefix.length), secret)
            this.signedCookies[name] = parseJson(decodedVal)
          } 
          this.cookies[name] = parseJson(val)
        }.bind(this))
      } catch (e) {
        return this.throw(400, e)
      }
    }
    
    yield next
  }
}

exports.prefix = 's:'

// The following two methods are adapted from https://github.com/visionmedia/node-cookie-signature
exports.sign = function(val, secret) {
  return val + '.' + crypto
    .createHmac('sha256', secret)
    .update(val)
    .digest('base64')
    .replace(/\=+$/, '')
}

exports.unsign = function(val, secret) {
  var dot = val.lastIndexOf('.'),
      str = val.substring(0, dot),
      mac = exports.sign(str, secret)
  if (mac === val) return str
  throw new Error('Invalid signature')
}

function parseJson(val) {
  try {
    return JSON.parse(val)
  } catch(e) {
    return val
  }
}