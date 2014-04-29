starweb
=======

Simple [generator-based](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators) web framework inspired by [koa](https://github.com/koajs/koa). Generator execution is powered by [starx](https://github.com/buunguyen/starx).

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

- [x] Cookie: done
- [x] Session: done
- [ ] Static
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

Contribution is welcome!