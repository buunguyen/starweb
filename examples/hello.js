starweb = require('../lib')
favicon = require('../lib/middleware/favicon')
logger  = require('../lib/middleware/logger')
app     = starweb()

app.use(app.logger())
app.use(app.favicon('favicon.ico'))

app.use(function *() {
  // html (todo: should really be text)
  this.body = 'hello, world'

  // json
  // this.body = {
  //   hello: 'world'
  // }

  // stream
  // this.body = require('fs').createReadStream(__filename)

  // todo: text, buffer
})

app.run(8000)