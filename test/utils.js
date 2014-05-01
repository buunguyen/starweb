require('./helper')
utils = require('../lib/utils')

describe('Utils', function() {
  describe('.proxy()', function() {
    var spy, src

    beforeEach(function() {
      spy = sinon.spy()
      src = {
        get field() {
          spy()
          return this._field || TOKEN
        },
        set field(val) {
          spy(val)
          this._field = val
        },
        method: function() {
          spy.apply(this, arguments)
          return TOKEN
        }
      }
    })

    it('proxies getter', function() {
      var obj = { src: src }
      utils.proxy(obj, {
        src: {
          field: 'getter'
        }
      })
      var f = obj.field
      expect(spy.callCount).to.equal(1)
    })

    it('proxies setter', function() {
      var obj = { src: src }
      utils.proxy(obj, {
        src: {
          field: 'setter'
        }
      })
      obj.field = TOKEN
      expect(spy.withArgs(TOKEN).callCount).to.equal(1)
    })  

    it('proxies accessor', function() {
      var obj = { src: src }
      utils.proxy(obj, {
        src: {
          field: 'access'
        }
      })
      obj.field = TOKEN
      expect(obj.field).to.equal(TOKEN)
    })  

    it('proxies method', function() {
      var obj = { src: src }
      utils.proxy(obj, {
        src: {
          method: 'invoke'
        }
      })
      obj.method(TOKEN)
      expect(spy.withArgs(TOKEN).callCount).to.equal(1)
    })

    it('proxies into a different name', function() {
      var obj = { src: src }
      utils.proxy(obj, {
        src: {
          field  : ['access', 'field2'],
          method : ['invoke', 'method2']
        }
      })
      
      obj.field2 = TOKEN
      expect(obj.field2).to.equal(TOKEN)

      spy.reset()
      obj.method2(TOKEN)
      expect(spy.withArgs(TOKEN).callCount).to.equal(1)
    })
  })
})