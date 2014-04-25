global.starweb = require('../lib/app')
global.starx   = require('starx')
global.expect  = require('chai').expect
global.assert  = require('chai').assert
global.sinon   = require('sinon')
global.request = require('supertest')

global._catch = function(done, fn) {
  try {
    fn()
  } catch (e) {
    done(e)
  }
}

global.YRequest = YRequest = {}
;['get', 'post', 'delete', 'head'].forEach(function(method) {
  YRequest[method] = starx.yieldable(function(server, path, opts, cb) {
    if (typeof opts === 'function') cb = opts
    opts        = opts || {}
    opts.send   = opts.send || {}
    opts.set    = opts.set || {}
    opts.expect = opts.expect || []
    
    var res = request(server)[method](path)

    Object.keys(opts.send).forEach(function(k) {
      res = res.send(k, opts.send[k]) 
    })

    Object.keys(opts.set).forEach(function(k) {
      res = res.set(k, opts.set[k]) 
    })

    if (opts.expect) {
      if (!(opts.expect instanceof Array)) opts.expect = [opts.expect]
      opts.expect.forEach(function(cond) {
        if (!(cond instanceof Array)) cond = [cond]
        res = res.expect.apply(res, cond)
      })  
    }

    res.end(cb)
  })
})