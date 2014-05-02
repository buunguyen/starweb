var fs = require('fs')
  , utils = require('../utils')

exports = module.exports = html

function html() {
  return {
    name   : 'html',
    exts   : ['.html', '.htm'],
    render : function *(viewPath, locals) {
      return yield utils.readFile(viewPath, 'utf8')
    }
  }
}