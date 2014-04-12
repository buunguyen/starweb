var url   = require('url')
var proxy = require('./proxy')

exports = module.exports = Context

function Context(app, req, res) {
  var self = this
  this.app = app
  this.req = req
  this.res = res

  var socket = res.socket
  res.on('finish', done)
  socket.on('error', done)
  socket.on('close', done)
  
  function done(err) {
    res.removeListener('finish', done)
    socket.removeListener('error', done)
    socket.removeListener('close', done)
    self.onerror(err)
  }
}

Context.prototype = {
  onerror: function(err) {
    if (!err) return
    this.app.onerror(err)
    if (!this.writable) return
    this.res._headers = {}
    this.type = 'text/plain'
    this.status = err.code === 'ENOENT' ? 404 : (err.status || 500)
    this.length = Buffer.byteLength(err.message)
    this.res.end(err.message)
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

proxy(Context.prototype, {
  req: {
    method : 'access',
    url    : 'access',
    secure : 'getter',
  },
  res: {
    
  }
})