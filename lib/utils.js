// isX
exports.isUndefined = function(obj) {
  return typeof obj === 'undefined'
}
;['Array', 'Function', 'String', 'Number', 'Boolean', 'Date', 'RegExp'].forEach(function(type) {
  exports['is' + type] = function(obj) {
    return Object.prototype.toString.call(obj) === '[object $]'.replace('$', type)
  }
})

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