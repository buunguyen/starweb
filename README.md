starweb
=======

Simple [generator-based](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators) web framework inspired by [koa](https://github.com/koajs/koa). The goal is getting the most done in the least amount of code while effectively demonstrating key concepts in building a generator-based web framework from scratch.

### Run test

```
make
```

### Example

```javascript
starx = require('starx')
app   = require('starweb')()
read  = starx.yieldable(require('fs').readFile)

app.use(app.logger())
app.use(app.favicon())

app.use(function *() {
  this.body = yield read(__filename)
})

app.run(8000)
```

### Todo

- [x] Cookie
- [x] Session
- [x] Session store support
- [x] Static
- [ ] Router
- [ ] Template/view engine
- [ ] Query/body/JSON
- [ ] Cache
- [ ] Upload
- [ ] Method override
- [ ] ETag, fresh...
- [ ] Auth ?
- [ ] Cors
- [ ] SSL support
- [ ] Cluster
- [ ] Non-trivial demo