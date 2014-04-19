exports = module.exports = session
session.MemoryStore = MemoryStore

function session(opts) {
  opts = opts || {}
  opts.key = opts.key || 'sid'
  opts.store = opts.store || new MemoryStore()

  return function *(next) {
    if (this.session) return yield next 
    if (!this.cookies) throw new Error('session middleware requires cookies middleware')
    this.session = new Session(this, opts || {})
    try {
      yield next
    } catch (e) { 
      throw e 
    } finally {
      this.session.save()
    }
  }
}

function Session(ctx, opts) {
  this.$key = opts.key
  this.$store = opts.store

  var sid = ctx.cookies[this.$key]
  if (sid == null) {
    sid = this.$store.create()
    var cookieOpts = opts.cookie || {}
    delete cookieOpts.maxAge
    delete cookieOpts.expires
    ctx.cookie(this.$key, sid /* todo: sign with secret */, cookieOpts)
  }
  this.$sid = sid

  var session = this.$store.get(sid)
  for (var k in session) this[k] = session[k]
}

Session.prototype = {
  save: function() {
    var session = {}
    for (var k in this)
      if (k.indexOf('$') !== 0 && typeof this[k] !== 'function')
        session[k] = this[k]
    this.$store.set(this.$sid, session)
  },

  destroy: function() {
    for (var k in this)
      if (k.indexOf('$') !== 0 && typeof this[k] !== 'function')
        delete this[k]
    this.$store.del(this.$sid)
  }
}

// todo: I want a cookie store
function MemoryStore() {
  if (!(this instanceof MemoryStore)) return new MemoryStore
}
MemoryStore.prototype = {
  create: function() {
    var sid = guid()
    this[sid] = {}
    return sid
  },

  get: function(sid) {
    return this[sid] || (this[sid] = {})
  },

  set: function(sid, session) {
    this[sid] = session
  },

  del: function(sid) {
    delete this[sid]
  }
}

// http://stackoverflow.com/a/2117523/17815
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8)
    return v.toString(16)
  })
}