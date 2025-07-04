import * as helper from '../src/utils/helper'

describe('Test string to boolean', () => {
  it('should convert a string to boolean', () => {
    // test success (true)
    expect(helper.StringToBoolean('true')).toBeTruthy()
    // test success (false)
    expect(helper.StringToBoolean('false')).toBeFalsy()
    // test success (falsy value)
    expect(helper.StringToBoolean('')).toBeFalsy()
  })
})

describe('Test join url', () => {
  it('should join two url parts', () => {
    // test success (second part starts with slash)
    expect(helper.joinURL('part1/', '/part2')).toBe('part1/part2')
    // test success (first part not ending with slash)
    expect(helper.joinURL('part1', '/part2')).toBe('part1/part2')
    // test success (second part not starting with slash)
    expect(helper.joinURL('part1/', 'part2')).toBe('part1/part2')
  })
})

describe('Test clone', () => {
  it('should clone an object or an array', () => {
    // test success (object)
    expect(helper.clone({ foo: 'bar' })).toStrictEqual({ foo: 'bar' })
    // test success (array)
    expect(helper.clone([1, 2, 3])).toStrictEqual([1, 2, 3])
  })
})

describe('Test trim', () => {
  it('should test trim', () => {
    // test success (begins and ends with spaces)
    expect(helper.trim('   xxxxxxxx   ', ' ')).toBe('xxxxxxxx')
  })
})

describe('Test getStripeLocale', () => {
  it('should test getStripeLocale', () => {
    // test success (value found)
    expect(helper.getStripeLocale('en')).toBe('en')
    // test success (value not found so should return default one)
    expect(helper.getStripeLocale('')).toBe('auto')
  })
})

describe('Test safeStringify', () => {
  it('should safe stringify an object', () => {
    // test success (object)
    expect(helper.safeStringify({ foo: 'bar' })).toStrictEqual('{"foo":"bar"}')
    // test failure
    const obj = {
      get foo() {
        throw new Error('Cannot access foo')
      }
    }
    expect(helper.safeStringify(obj)).toStrictEqual('[Unserializable object]')
  })
})

describe('Test formatPrice', () => {
  it('should test formatPrice', () => {
    // test success ($10)
    expect(helper.formatPrice(10, '$', 'en')).toBe('$10')
    // test success ($10.50)
    expect(helper.formatPrice(10.5, '$', 'en')).toBe('$10.50')
    // test success (10 €)
    expect(helper.formatPrice(10, '€', 'en')).toBe('10 €')
    // test success (10.50 €)
    expect(helper.formatPrice(10.5, '€', 'en')).toBe('10.50 €')
  })
})

describe('Test formatPayPalPrice', () => {
  it('should test formatPayPalPrice', () => {
    // test success (10)
    expect(helper.formatPayPalPrice(10)).toBe('10.00')
    // test success (10.5)
    expect(helper.formatPayPalPrice(10.5)).toBe('10.50')
    // test success (10.50)
    expect(helper.formatPayPalPrice(10.50)).toBe('10.50')
    // test success (10.5123)
    expect(helper.formatPayPalPrice(10.5123)).toBe('10.51')
  })
})

describe('Test delay', () => {
  it('should test delay', async () => {
    // test success
    let res = true
    try {
      await helper.delay(100)
    } catch {
      res = false
    }
    expect(res).toBeTruthy()
  })
})
