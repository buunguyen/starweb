starweb = require('../lib/app')
app     = starweb()

app.use(app.logger())
app.use(app.favicon('favicon.ico'))

app.use(function *() {
  // text
  this.body = 'hello, world'

  // html
  // this.body = '<em>hello, world</em>'

  // json
  // this.body = {
  //   hello: 'world'
  // }

  // stream
  // this.body = require('fs').createReadStream(__filename)

  // todo: text, buffer
})

app.run(8000)