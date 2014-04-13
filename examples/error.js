starweb = require('../lib/app')
app     = starweb()

app.use(function *() {
  throw new Error('bad thing')
})

app.error(function(err) {
  console.error(err)
})

app.run(8000)