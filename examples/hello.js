starweb = require('../lib')
logger  = require('../lib/middleware/logger')
app     = starweb()

app.use(logger())

app.use(function *() {
  var txt = 'hello, word'
  this.setHeader('Content-Type', 'text/html')
  this.setHeader('Content-Length', Buffer.byteLength(txt))
  this.write(txt)
})

app.run(8000)