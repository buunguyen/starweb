exports = module.exports = session
session.MemoryStore = MemoryStore

function session(opts) {
  opts = opts || {}
  opts.key = opts.key || 'sid'
  opts.store = opts.store || new MemoryStore()

  return function *(next) {
    if (this.session) return yield next 
    if (!this.cookies) throw new Error('session middleware requires cookies middleware')
    if (this.secret == null) throw new Error('secret must be supplied to cookies middleware')
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
  this.$ctx = ctx
  this.$key = opts.key
  this.$store = opts.store
  opts.cookie = opts.cookies || {}
  opts.cookie.sign = true 

  var sid = ctx.signedCookies[this.$key]
  if (sid == null) {
    sid = this.$store.create(ctx)
  }
  this.$sid = sid
  ctx.cookie(this.$key, sid, opts.cookie)

  var session = this.$store.get(ctx, sid)
  for (var k in session) this[k] = session[k]
}

Session.prototype = {
  save: function() {
    var session = {}
    for (var k in this)
      if (k.indexOf('$') !== 0 && typeof this[k] !== 'function')
        session[k] = this[k]
    this.$store.set(this.$ctx, this.$sid, session)
  },

  destroy: function() {
    for (var k in this)
      if (k.indexOf('$') !== 0 && typeof this[k] !== 'function')
        delete this[k]
    this.$store.del(this.$ctx, this.$sid)
  }
}

// MemoryStore implementation
function MemoryStore() {
  if (!(this instanceof MemoryStore)) return new MemoryStore
}
MemoryStore.prototype = {
  create: function(ctx) {
    var sid = guid()
    this[sid] = {}
    return sid
  },

  get: function(ctx, sid) {
    return this[sid] || (this[sid] = {})
  },

  set: function(ctx, sid, session) {
    this[sid] = session
  },

  del: function(ctx, sid) {
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