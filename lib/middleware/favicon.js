var fs       = require('fs')
  , starx    = require('starx')
  , resolve  = require('path').resolve
  , readFile = starx.yieldable(require('fs').readFile)
  , defaultIcon = new Buffer('AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAA/4QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAAAAAQABAAEAAAAAEAEAEAAAAAABAQEAAAAAAAAREAAAAAEREREREREAAAAAERAAAAAAAAEBAQAAAAAAEAEAEAAAAAEAAQABAAAAAAABAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAD//wAA/38AAP9/AAD3dwAA+28AAP1fAAD+PwAAwAEAAP4/AAD9XwAA+28AAPd3AAD/fwAA/38AAP//AAD//wAA', 'base64')

exports = module.exports = favicon

function favicon(path) {
  return function *(next) {
    if (this.path !== '/favicon.ico') return yield next
    var img = path 
      ? yield readFile(resolve(path))
      : defaultIcon
    this.type = 'image/x-icon'
    this.body = img
  }
}