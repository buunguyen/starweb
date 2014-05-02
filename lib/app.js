var http = require('http') 
  , domain = require('domain') 
  , fs = require('fs')
  , path = require('path')
  , starx = require('starx')
  , EventEmitter = require('events').EventEmitter
  , Context = require('./context')
  , utils = require('./utils')

exports = module.exports = App
exports.Context = Context
exports.utils = utils

function App() {
  if (!(this instanceof App)) return new App()
  EventEmitter.call(this)
  this.middleware = []
  this.viewEngines = []
  this.viewRoot = './views'

  // Needs at least 1 listener for EE not to exit on 'error'
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
  },

  views: function(root, engines) {
    if (utils.isString(root)) this.viewRoot = root
    else engines = root
    if (engines == null) throw new Error('At least one view engine must be specified')
    if (!utils.isArray(engines)) engines = [engines]
    engines.forEach(function(engine) {
      this.viewEngines.push(engine)
    }.bind(this))
  }
}

utils.extend(App.prototype, EventEmitter.prototype)

// Loads view engines
var files = fs.readdirSync(path.join(__dirname, './viewEngines'))
files.forEach(function(filePath) {
  var name = path.basename(filePath, '.js')
  App.prototype[name] = require('./viewEngines/' + name + '.js')
})

// Loads middleware
var files = fs.readdirSync(path.join(__dirname, './middleware'))
files.forEach(function(filePath) {
  var name = path.basename(filePath, '.js')
  App.prototype[name] = require('./middleware/' + name + '.js')
})

// Dispatches a request through middleware
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