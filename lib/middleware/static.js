var path = require('path')
  , fs   = require('fs')
  , mime = require('mime')
  , y    = require('starx').yieldable

exports = module.exports = static

function static(root) {
  root = root || './public'

  return function *(next) {
    var filePath = path.resolve(path.join(root, this.path))
    try {
      var stat    = yield y(tryServe)(filePath)
      this.type   = mime.lookup(path.extname(stat.path))
      this.length = stat.size
      this.body   = fs.createReadStream(stat.path)
    } catch(err) {
      if (err.code === 'ENOENT') yield next
      else this.throw(500, err)
    }
  }
}

function tryServe(filePath, cb) {
  fs.stat(filePath, function(err, stat) {
    if (err) return cb(err)
    if (stat.isDirectory()) return tryServe(path.join(filePath, 'index.html'), cb)
    stat.path = filePath
    cb(null, stat)
  })
}