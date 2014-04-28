var url   = require('url')
  , proxy = require('./proxy')
  , extend = require('util')._extend
  , EventEmitter = require('events').EventEmitter

exports = module.exports = Context

function Context(app, req, res) {
  var self = this
  this.app = app
  this.req = req
  this.res = res
  this.done = this.done.bind(this)
  EventEmitter.call(this)

  var socket = res.socket
  res.on('finish', done)
  socket.on('error', done)
  socket.on('close', done)
  
  function done(err) {
    res.removeListener('finish', done)
    socket.removeListener('error', done)
    socket.removeListener('close', done)
    self.done(err)
  }
}

Context.prototype = {
  done: function(err) {
    if (this._notifiedDone === true) return
    if (err) {
      if (this.writable) {
        this.res._headers = {}
        this.type = 'text/plain'
        this.status = err.code === 'ENOENT' ? 404 : (err.status || 500)
        this.length = Buffer.byteLength(err.message)
        this.res.end(err.message)
      }
      this.app.emit('error', err)
    } 
    this._notifiedDone = true
    this.emit('done', err)
  },

  throw: function(status, err) {
    status = status || 500
    err = err || {}
    err.status = status
    err.message = err.message || status.toString()
    this.done(err)
  },

  /*
   * opts: { path: ..., domain: ..., expires: ...,  maxAge: ..., httpOnly: ..., secure: ..., sign: ... }
   */
  cookie: function(name, val, opts) {
    if (!opts) opts = {}

    if (typeof val == 'object') val = JSON.stringify(val)
    if (this.secret && opts.sign) {
      val = this.app.cookies.prefix + this.app.cookies.sign(val, this.secret)
    }
    
    var headerVal = name + '=' + val + '; Path=' + (opts.path || '/')
    if (opts.domain)   headerVal += '; Domain=' + opts.domain
    if (opts.expires) {
      if (typeof opts.expires === 'number') opts.expires = new Date(opts.expires)
      if (opts.expires instanceof Date) opts.expires = opts.expires.toUTCString()
      headerVal += '; Expires=' + opts.expires
    }
    if (opts.maxAge)   headerVal += '; Max-Age=' + opts.maxAge
    if (opts.httpOnly) headerVal += '; HttpOnly'
    if (opts.secure)   headerVal += '; Secure'
    this.res.setHeader('Set-Cookie', headerVal)
  },

  get writable() {
    var socket = this.res.socket
    return socket && socket.writable && !this.res.headersSent
  },

  get path() {
    return url.parse(this.url).pathname
  },
  set path(val) {
    var obj = url.parse(this.url)
    obj.pathname = val
    this.url = url.format(obj)
  },

  get status() {
    return this._status
  },
  set status(code) {
    this._status = this.res.statusCode = code
  },

  get type() {
    return this.res.getHeader('Content-Type')
  },
  set type(val) {
    if (val == null) return this.res.removeHeader('Content-Type')
    this.res.setHeader('Content-Type', val)
  },

  get length() {
    return this.res.getHeader('Content-Length')
  },
  set length(val) {
    if (val == null) return this.res.removeHeader('Content-Length')
    this.res.setHeader('Content-Length', val)
  },

  get body() {
    return this._body
  },
  set body(val) {
    this._body = val
  }
}

extend(Context.prototype, EventEmitter.prototype)

proxy(Context.prototype, {
  req: {
    method : 'access',
    url    : 'access',
    secure : 'getter',
  },
  res: {
    
  }
})