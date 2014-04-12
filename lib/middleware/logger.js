exports = module.exports = function() {
  return function *(next) {
    var start = new Date()
    yield next
    console.log('%s %s ~ %s ms', this.method, this.url, ~~(new Date() - start))
  }
}