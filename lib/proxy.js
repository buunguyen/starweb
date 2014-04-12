exports = module.exports = proxy

function proxy(proto, mappings) {
  for (var target in mappings) {
    var mappingsForTarget = mappings[target];
    for (var name in mappingsForTarget) {
      var operation = mappingsForTarget[name]
      switch(operation) {
        case 'access' : addGetter(proto, target, name); addSetter(proto, target, name); break
        case 'getter' : addGetter(proto, target, name); break
        case 'setter' : addSetter(proto, target, name); break
        case 'invoke' : addInvoke(proto, target, name); break
        default: throw new Error('Unsupported proxy operation: ' + operation)
      }
    }
  }
}

function addInvoke(proto, target, name) {
  proto[name] = function() {
    this[target][name].apply(this[target], arguments)
  }
}

function addGetter(proto, target, name) {
  proto.__defineGetter__(name, function() {
    return this[target][name]
  })
}

function addSetter(proto, target, name) {
  proto.__defineSetter__(name, function(value) {
    this[target][name] = value
  })
}