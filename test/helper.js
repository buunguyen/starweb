request = require('supertest')
starx   = require('starx')

global._catch = function(done, fn) {
  try {
    fn()
  } catch (e) {
    done(e)
  }
}

global._req = starx.yieldable(function(server, path, opts, cb) {
  if (typeof opts === 'function') cb = opts
  opts         = opts || {}
  opts.sets    = opts.sets || {}
  opts.expects = opts.expects || []
  if (!(opts.expects instanceof Array)) opts.expects = [opts.expects]

  var res = request(server).get(path)
  Object.keys(opts.sets).forEach(function(k) {
    res = res.set(k, opts.sets[k]) 
  })

  opts.expects.forEach(function(cond) {
    res = res.expect(cond)
  }) 
  
  res.end(cb);
})