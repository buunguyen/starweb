var ejs  = require('ejs')
  , starx = require('starx')
  , renderFile = starx.yieldable(ejs.renderFile)
  , utils = require('../utils')

exports = module.exports = _ejs

function _ejs(options) {
  options = utils.extend({}, {
    cache        : true,
    debug        : false,
    compileDebug : false,
  }, options)

  return {
    name   : 'ejs',
    render : function *(viewPath, locals) {
      return yield renderFile(viewPath, utils.extend({}, options, locals))
    }
  }
}