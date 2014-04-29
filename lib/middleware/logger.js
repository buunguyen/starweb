var utils = require('../utils')

exports = module.exports = log

function log(pattern) {
  pattern = pattern || '%method %url -> %status ~ %elapsed ms'

  return function *(next) {
    var start = new Date()

    this.on('done', function(err) {
      var elapsed = ~~(new Date() - start)
      
      var result = pattern.replace(/%(\w+)/g, function(match, prop) {
        return prop === 'elapsed' ? elapsed : this[prop]
      }.bind(this))

      console.log(this.status < 400 ? result.cyan : result.red)
    })
    yield next
  }
}