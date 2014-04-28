var http = require('http') 
var domain = require('domain') 
var starx = require('starx')
var EventEmitter = require('events').EventEmitter
var Context = require('./context')
var utils = require('./utils')

exports = module.exports = App

function App() {
  if (!(this instanceof App)) return new App()
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
    var server = http.createServer(handler.bind(this))
    server.listen.apply(server, arguments)
    return server
  }
}

utils.extend(App.prototype, EventEmitter.prototype)

;['logger', 'favicon', 'cookies', 'session'].forEach(function(name) {
  App.prototype[name] = require('./middleware/' + name)
})

function handler(req, res) {  
  var middleware = [serve].concat(this.middleware)
    , ctx = new Context(this, req, res)
    , next = noop()
    // , d = domain.create()

  while (middleware.length) {
    next = middleware.pop().call(ctx, next)
  }
  starx(next).call(ctx, ctx.done)
  // d.on('error', ctx.done)
}

function *noop() {}

function *serve(next) {
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