starx = require('starx')
app = require('../lib/app')()

readFile = starx.yieldable(require('fs').readFile)

app.use(function *() {
  this.body = '<p>Read files async, but without callback</p>'
  var names = ['hello.js', 'async.js']
  for (var i = 0; names[i]; i++) {
    this.body += '<pre>' + (yield readFile(__dirname + '/' + names[i])) + '</pre>'
  }
})

port = process.argv[2] || 8000
app.run(port)
console.log('Server is running at port ' + port)