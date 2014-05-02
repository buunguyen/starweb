starweb
=======

Simple [generator-based](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators) web framework inspired by [koa](https://github.com/koajs/koa) and developed from the ground up. The framework comes bundled with essential middleware (see list below).

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
- [x] Session store
- [x] Static
- [x] Router
- [x] Basic authentication
- [x] View engine
- [x] EJS integration
- [x] Jade integration
- [ ] Query/body/JSON
- [ ] Cache
- [ ] Upload
- [ ] Method override
- [ ] ETag, fresh...
- [ ] Cors
- [ ] SSL support
- [ ] Cluster
- [ ] Non-trivial demo