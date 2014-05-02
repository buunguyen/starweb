// copy built-in util & underscore
var _ = require('underscore')
  , util = require('util')
  , fs = require('fs')
  , starx = require('starx')
  , y = starx.yieldable
  , exports = module.exports = _.extend({}, _, util)

// ANSI colors
// https://coderwall.com/p/yphywg
var reset = "\x1b[0m"
var colors = {
  black      : "\x1b[30m",
  red        : "\x1b[31m",
  green      : "\x1b[32m",
  yellow     : "\x1b[33m",
  blue       : "\x1b[34m",
  magenta    : "\x1b[35m",
  cyan       : "\x1b[36m",
  white      : "\x1b[37m",
}
for (var color in colors) {
  (function(code) {
    String.prototype.__defineGetter__(color, function() {
      return code + this + reset
    })
  })(colors[color])
}

// fs stuff
exports.fileExists = y(function(filePath, cb) {
  fs.exists(filePath, function(exist) {
    cb(null, exist)
  })
})
exports.readFile = y(fs.readFile)

// Proxy
exports.proxy = proxy
function proxy(dest, mappings) {
  for (var srcKey in mappings) {
    for (var srcProp in mappings[srcKey]) {
      var op = mappings[srcKey][srcProp],
          destProp = srcProp
      if (exports.isArray(op)) {
        destProp = op[1]
        op = op[0]
      }
      switch(op) {
        case 'access' : addGetter(srcKey, srcProp, dest, destProp);
                        addSetter(srcKey, srcProp, dest, destProp); break
        case 'getter' : addGetter(srcKey, srcProp, dest, destProp); break
        case 'setter' : addSetter(srcKey, srcProp, dest, destProp); break
        case 'invoke' : addInvoke(srcKey, srcProp, dest, destProp); break
        default: throw new Error('Unsupported proxy operation: ' + op)
      }
    }
  }
}

function addInvoke(srcKey, srcProp, dest, destProp) {
  dest[destProp] = function() {
    return this[srcKey][srcProp].apply(this[srcKey], arguments)
  }
}

function addGetter(srcKey, srcProp, dest, destProp) {
  dest.__defineGetter__(destProp, function() {
    return this[srcKey][srcProp]
  })
}

function addSetter(srcKey, srcProp, dest, destProp) {
  dest.__defineSetter__(destProp, function(value) {
    this[srcKey][srcProp] = value
  })
}