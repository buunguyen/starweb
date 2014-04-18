exports = module.exports = log

function log() {
  return function *(next) {
    var start = new Date()
    try {
      yield next
    } catch (e) {
      throw e
    } finally {
      // TODO: log status (probably need an 'end' hook)
      console.log('%s %s ~ %s ms', this.method, this.url, ~~(new Date() - start))
    }
  }
}