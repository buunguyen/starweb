var fs       = require('fs')
var starx    = require('starx')
var resolve  = require('path').resolve
var readFile = starx.yieldable(require('fs').readFile)

exports = module.exports = favicon

function favicon(path) {
  return function *(next) {
    if (this.path === '/favicon.ico') {
      // TODO: if file not exist, what happens???
      var img = path 
        ? yield readFile(resolve(path))
        : new Buffer('AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAA/4QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAAAAAQABAAEAAAAAEAEAEAAAAAABAQEAAAAAAAAREAAAAAEREREREREAAAAAERAAAAAAAAEBAQAAAAAAEAEAEAAAAAEAAQABAAAAAAABAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAD//wAA/38AAP9/AAD3dwAA+28AAP1fAAD+PwAAwAEAAP4/AAD9XwAA+28AAPd3AAD/fwAA/38AAP//AAD//wAA', 'base64')
      this.type = 'image/x-icon'
      this.body = img
    } 
    else yield next
  }
}