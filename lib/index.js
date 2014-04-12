var http  = require('http') 
var starx = require('starx')
var Context = require('./context')

exports = module.exports = App

function App() {
  if (!(this instanceof App)) return new App()
  this.middleware = []
}

App.prototype = {
  use: function(mw) {
    this.middleware.push(mw)
  },

  run: function() {
    var server = http.createServer(requestHandler.bind(this))
    server.listen.apply(server, arguments)
  },

  onerror: function(err) {
    if (!err) return
    console.error(err)
  }
}

;['logger', 'favicon'].forEach(function(name) {
  App.prototype[name] = require('./middleware/' + name)
})

function requestHandler(req, res) {
  var middleware = [respondHandler].concat(this.middleware)
  var ctx = new Context(this, req, res)
  var next = noop()
  while (middleware.length) {
    next = middleware.pop().call(ctx, next)
  }

  // TODO: handle uncaught error in starx
  starx(next).call(ctx, ctx.onerror)
}

function *noop() {}

function *respondHandler(next) {
  yield next

  if (!this.writable) return

  var head = this.method === 'HEAD'
  var body = this.body
  this.status = this.status || 200

  if (body == null) {
    this.type = this.length = null
    return this.res.end()
  } 

  if (typeof body === 'string') {
    this.type = this.type || 'text/html'
    this.length = Buffer.byteLength(body)
    return this.res.end(head ? null : body)
  } 

  if (Buffer.isBuffer(body)) {
    this.type = this.type || 'application/octet-stream'
    this.length = body.length;
    return this.res.end(head ? null : body)
  }

  if (typeof body.pipe === 'function') {
    if (body.listeners('error').indexOf(this.onerror) >= 0) 
      body.on('error', this.onerror)
    if (head) {
      body.close && body.close()
      return this.res.end()
    }
    return body.pipe(this.res)
  }

  body = JSON.stringify(body)
  this.type = this.type || 'application/json'
  this.length = Buffer.byteLength(body)
  this.res.end(head ? null : body)
}