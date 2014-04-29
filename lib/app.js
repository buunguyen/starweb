var http = require('http') 
  , domain = require('domain') 
  , starx = require('starx')
  , EventEmitter = require('events').EventEmitter
  , extend = require('util')._extend
  , Context = require('./context')

exports = module.exports = App

function App() {
  if (!(this instanceof App)) return new App()
  EventEmitter.call(this)
  this.middleware = []
  // Needs at least one listener for EventEmitter not to exit program in 'error'
  this.on('error', function() {})
}

App.prototype = {
  use: function(middleware) {
    this.middleware.push(middleware)
    return this
  },

  run: function() {
    var server = http.createServer(dispatch.bind(this))
    server.listen.apply(server, arguments)
    return server
  }
}

extend(App.prototype, EventEmitter.prototype)

;['logger', 'favicon', 'cookies', 'session'].forEach(function(name) {
  App.prototype[name] = require('./middleware/' + name)
})

function dispatch(req, res) {  
  var middleware = [serve].concat(this.middleware)
    , ctx = new Context(this, req, res)
    , next = noop()

  while (middleware.length) {
    next = middleware.pop().call(ctx, next)
  }
  starx(next).call(ctx, ctx.done)
}

function *noop() {}

function *serve(next) {
  yield next

  if (!this.writable) return

  var head = this.method === 'HEAD'
  var body = this.body
  
  if (body == null) {
    this.status = this.status || 404
    this.type = this.length = null
    return this.res.end()
  } 

  this.status = this.status || 200
  if (typeof body === 'string') {
    this.type = this.type || (/<[a-z][\s\S]*>/i.test(body) ? 'text/html' : 'text/plain')
    this.length = Buffer.byteLength(body)
    return this.res.end(head ? null : body)
  } 

  if (Buffer.isBuffer(body)) {
    this.type = this.type || 'application/octet-stream'
    this.length = body.length;
    return this.res.end(head ? null : body)
  }

  if (typeof body.pipe === 'function') {
    if (!~body.listeners('error').indexOf(this.done)) body.on('error', this.done)
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