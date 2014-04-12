var proxy = require('./proxy')

exports = module.exports = Context

function Context(req, res) {
  this.req = req
  this.res = res
}

proxy(Context.prototype, {
  req: {
    method : 'access',
    url    : 'access',
    secure : 'getter'
  },
  res: {
    write      : 'invoke',
    end        : 'invoke',
    setHeader  : 'invoke',
    statusCode : 'setter'
  }
})