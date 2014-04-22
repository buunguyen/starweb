exports.extend = function(des, src) {
  for (var key in src) des[key] = src[key]
}