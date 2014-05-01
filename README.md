starweb
=======

Simple [generator-based](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators) web framework inspired by [koa](https://github.com/koajs/koa) but developed from the ground up. The goal is getting the most done in the least amount of code while effectively demonstrating key concepts in implementing a generator-based web framework. The framework also comes bundled with essential middleware whose development status is at the bottom of this page.

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
- [ ] View engine
- [ ] EJS integration
- [ ] Jade integration
- [ ] Query/body/JSON
- [ ] Cache
- [ ] Upload
- [ ] Method override
- [ ] ETag, fresh...
- [ ] Cors
- [ ] SSL support
- [ ] Cluster
- [ ] Non-trivial demo