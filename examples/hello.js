starweb = require('../lib/app')
app     = starweb()

app.use(app.logger())
app.use(app.favicon('favicon.ico'))
app.use(app.static(__dirname))

app.use(function *() {
  // text
  // this.body = 'hello, world'

  // html
  // this.body = '<em>hello, world</em>'

  // buffer
  // this.body = new Buffer('download me')

  // json
  this.body = {
    hello: 'world'
  }

  // stream
  // this.body = require('fs').createReadStream(__filename)
})

app.on('error', function(err) {
  console.error(err)
})

port = process.argv[2] || 8000
app.run(port)
console.log('Server is running at port ' + port)