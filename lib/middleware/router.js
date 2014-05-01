var METHODS = require('http').METHODS

exports = module.exports = router

function router() {
  if (this._routes) throw new Error('router middleware is already registered')
  var routes = this._routes = {}
  addRouteMethods(this)

  return function *(next) {
    var matches = findRoutes(this.method, this.path)
      , nextRoute = function *() {}
      , match, oldParams

    if (matches.length) {
      // route1_mw_1 → route1_mw_2
      //                    ↓
      //                route2_mw_1 
      //                    ↓
      //                route3_mw_1 → route3_mw_2
      while (match = matches.pop()) {        
        nextRoute = (function(match, nextRoute) {
          return function *() {
            this.params = utils.extend({}, oldParams, match.params)
            yield routeMiddleware(this, match.route.fns, nextRoute)
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

  // Patches App with convenient route registration methods
  function addRouteMethods(app) {
    METHODS.forEach(function(method) {
      var methodName = method === 'DELETE' ? 'del' : method.toLowerCase()
      routes[method] = []

      app.__proto__[methodName] = function() {
        var path = arguments[0]
          , fns  = Array.prototype.slice.call(arguments, 1)
          , params = []
          , regexp = path
              .replace(/\//g, '\\/')
              .replace(/:(\w+)/g, function(match, $1) {
                params.push($1)
                return '([^\\/]+)'
              })

        if (regexp[regexp.length-1] !== '/') regexp += '\\/'
        regexp = '^' + regexp + '$'

        routes[method].push({
          fns    : fns,
          path   : path,
          regexp : new RegExp(regexp, 'i'),
          method : method,
          params : params
        })
      }  
    })
  }

  // Builds up a chain of route middleware and return the first one
  // Each middleware access to `next`, i.e. the next middleware and `nextRoute`
  // `next` and `nextRoute` are the same object for the last middleware in the chain
  function *routeMiddleware(ctx, fns, nextRoute) {
    var next = nextRoute
    while (fns.length) {
      next = fns.pop().call(ctx, next, nextRoute)
    }
    return next
  }

  // Finds all routes that match `method` and `path` and populates route params for each match
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