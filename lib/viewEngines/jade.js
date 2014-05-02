var jade = require('jade')
  , utils = require('../utils')

exports = module.exports = _jade

function _jade(options) {
  options = utils.extend({}, {
    cache        : true,
    self         : false,
    pretty       : false,
    debug        : false,
    compileDebug : false,
  }, options)

  return {
    name   : 'jade',
    render : function *(viewPath, locals) {
      return jade.renderFile(viewPath, utils.extend({}, options, locals))
    }
  }
}