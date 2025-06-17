import 'dotenv/config'
import * as helper from '../src/common/helper'

describe('Test string to boolean', () => {
  it('should convert a string to boolean', () => {
    expect(helper.StringToBoolean('true')).toBeTruthy()
    expect(helper.StringToBoolean('false')).toBeFalsy()
    expect(helper.StringToBoolean('')).toBeFalsy()
  })
})

describe('Test join url', () => {
  it('should join two url parts', () => {
    expect(helper.joinURL('part1/', '/part2')).toBe('part1/part2')
    expect(helper.joinURL('part1', '/part2')).toBe('part1/part2')
    expect(helper.joinURL('part1/', 'part2')).toBe('part1/part2')
  })
})

describe('Test clone', () => {
  it('should clone an object or an array', () => {
    expect(helper.clone({ foo: 'bar' })).toStrictEqual({ foo: 'bar' })
    expect(helper.clone([1, 2, 3])).toStrictEqual([1, 2, 3])
  })
})

describe('Test trim', () => {
  it('should test trim', () => {
    expect(helper.trim('   xxxxxxxx   ', ' ')).toBe('xxxxxxxx')
  })
})

describe('Test getStripeLocale', () => {
  it('should test getStripeLocale', () => {
    expect(helper.getStripeLocale('en')).toBe('en')
    expect(helper.getStripeLocale('')).toBe('auto')
  })
})

describe('Test formatPrice', () => {
  it('should test formatPrice', () => {
    expect(helper.formatPrice(1000.5, '$', 'en')).toBe('$1,000.50')
    expect(helper.formatPrice(1000, '€', 'fr')).toBe('1 000 €')
  })
})
