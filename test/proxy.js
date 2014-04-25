require('./helper')
proxy = require('../lib/proxy')

describe('Proxy', function(){
  it('proxies', function() {
    var delegate = {}
    delegate.__defineGetter__('field1', function() {
      return 'field1'
    })
    delegate.__defineSetter__('field2', function(val) {
      this._2 = val
    })
    delegate.__defineGetter__('field3', function() {
      return this._3
    })
    delegate.__defineSetter__('field3', function(val) {
      this._3 = val
    })
    delegate.method = function() {
      return 'method'
    }
    
    var obj = {
      passto: delegate
    }
    proxy(obj, {
      passto: {
        field1 : 'getter',
        field2 : 'setter',
        field3 : 'access',
        method : 'invoke',
      }
    })

    expect(obj.field1).to.equal('field1')

    obj.field2 = 'field2'
    expect(delegate._2).to.equal('field2')

    obj.field3 = 'field3'
    expect(obj.field3).to.equal('field3')

    expect(obj.method()).to.equal('method')
  })
})