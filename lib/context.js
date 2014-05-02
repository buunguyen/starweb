var url    = require('url')
  , path   = require('path')
  , fs     = require('fs')
  , utils  = require('./utils')
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
        this.resHeaders = {}
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

  render: function *(view, locals) {
    var app = this.app
      , viewPath = path.join(app.viewRoot, view)
      , ext = path.extname(viewPath)
      , exts, engine, content, testPath, i, j

    if (ext && !(yield utils.fileExists(viewPath))) throw new Error('View does not exist')

    for (i = 0; app.viewEngines[i]; i++) {
      exts = (app.viewEngines[i].exts || ['.' + app.viewEngines[i].name.toLowerCase()])
      
      if (ext) {
        if (~exts.indexOf(ext)) {
          engine = app.viewEngines[i]
          break
        }
      }
      
      for (j = 0; exts[j]; j++) {
        testPath = viewPath + exts[j]
        if (yield utils.fileExists(testPath)) {
          viewPath = testPath
          engine = app.viewEngines[i]
          break
        }
      }
    }
    
    if (!engine) return this.throw(500, new Error('View does not exist'))
    return yield engine.render(viewPath, locals)
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
    this.setResHeader('Set-Cookie', headerVal)
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
    return this.getResHeader('Content-Type')
  },
  set type(val) {
    if (val == null) return this.removeResHeader('Content-Type')
    this.setResHeader('Content-Type', val)
  },

  get length() {
    return this.getResHeader('Content-Length')
  },
  set length(val) {
    if (val == null) return this.removeResHeader('Content-Length')
    this.setResHeader('Content-Length', val)
  },

  get body() {
    return this._body
  },
  set body(val) {
    this._body = val
  }
}

utils.extend(Context.prototype, EventEmitter.prototype)

utils.proxy(Context.prototype, {
  req: {
    method  : 'access',
    url     : 'access',
    secure  : 'getter',
    headers : ['getter', 'reqHeaders'],
  },
  res: {
    _headers  : ['access', 'resHeaders'],
    getHeader : ['invoke', 'getResHeader'],
    setHeader : ['invoke', 'setResHeader'],
    removeHeader : ['invoke', 'removeResHeader']
  }
})