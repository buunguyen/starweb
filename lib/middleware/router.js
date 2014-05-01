exports = module.exports = router

var METHODS = ['OPTIONS', 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'TRACE', 'CONNECT']

function router() {
  if (this._routes) throw new Error('router middleware is already registered')
  var routes = this._routes = {}

  METHODS.forEach(function(method) {
    routes[method] = []
    this.__proto__[method.toLowerCase()] = function(path, fn) {
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
      , oldParams = this.params
    if (matches.length > 0) {
      var match = matches[0]
      this.params = utils.extend({}, oldParams, match.params)
      try {
        yield match.route.fn
      } finally {
        this.params = oldParams
      }
      // TODO: next within route -> next match
    }

    yield next
  }

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