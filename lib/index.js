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
  }
}

function requestHandler(req, res) {
  var middleware = this.middleware.concat([end])
  var ctx = new Context(req, res)
  var next = noop()
  while (middleware.length) {
    next = middleware.pop().call(ctx, next)
  }
  starx(next).call(ctx)
}

function *noop() {}

function *end() {
  this.end()
}