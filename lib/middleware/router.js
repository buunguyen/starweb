var METHODS = require('http').METHODS

exports = module.exports = router

function router() {
  if (this._routes) throw new Error('router middleware is already registered')
  var routes = this._routes = {}

  METHODS.forEach(function(method) {
    var methodName = method === 'DELETE' ? 'del' : method.toLowerCase()
    routes[method] = []
    this.__proto__[methodName] = function(path, fn) {
      var params = []
        , regexp = path
            .replace(/\//g, '\\/')
            .replace(/:(\w+)/g, function(match, $1) {
              params.push($1)
              return '([^\\/]+)'
            })
      if (regexp[regexp.length-1] !== '/') regexp += '\\/'
      regexp = '^' + regexp + '$'

      routes[method].push({
        fn     : fn,
        path   : path,
        regexp : new RegExp(regexp, 'i'),
        method : method,
        params : params
      })
    }  
  }.bind(this))

  return function *(next) {
    var matches = findRoutes(this.method, this.path)
      , nextRoute = noop()
      , match, oldParams

    if (matches.length > 0) {
      while (match = matches.pop()) {
        nextRoute = (function(match, nextRoute) {
          return function *() {
            this.params = utils.extend({}, oldParams, match.params)
            yield match.route.fn.call(this, nextRoute)
          }
        }).call(this, match, nextRoute)
      }
      try {
        oldParams = this.params
        yield nextRoute
      } finally {
        this.params = oldParams
      }
    }

    yield next
  }

  function *noop() {}

  function findRoutes(method, path) {
    var _routes = routes[method]
      , altPath = path[path.length-1] === '/' ? path.substring(0, path.length-1) : (path + '/') 
      , matches = []
      , route, match, params, i
    for (i = 0; route = _routes[i]; i++) {
      if (match = path.match(route.regexp) || altPath.match(route.regexp)) {
        params = {}
        route.params.forEach(function(p, index) {
          params[p] = match[index+1]
        })
        matches.push({
          route  : route,
          params : params
        })
      }
    }
    return matches
  }
}