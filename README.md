starweb
=======

Simple generator-based web framework (inspired by [koa](https://github.com/koajs/koa)). Generator execution is powered by [starx](https://github.com/buunguyen/starx). This is a learning project and not intended to be used in production (at least in its current stage).

Run test

* make

Examples

```javascript
starx = require('starx')
app = require('starweb')()

readFile = starx.yieldable(require('fs').readFile)

app.use(app.logger())
app.use(app.favicon())

app.use(function *() {
  this.body = '<p>Read file async, without callback</p>'
  var names = ['hello.js', 'async.js']
  for (var i = 0; names[i]; i++) {
  	this.body += '<pre>'
    this.body += yield readFile(__dirname + '/' + names[i])
    this.body += '</pre>'
  }
})

app.run(8000)
```

Todo

* Test for existing features: in progress 
* Cookie: done
* Session: done
* Static
* Route
* Query/body/JSON
* Cache
* Upload
* Method override
* ETag, fresh...
* Auth ?
* Cors
* SSL support
* Cluster
* Demo app