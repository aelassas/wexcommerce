import * as wexcommerceHelper from ':wexcommerce-helper'

describe('wexcommerceHelper', () => {
  describe('formatNumber', () => {
    it('should format whole numbers without decimals', () => {
      expect(wexcommerceHelper.formatNumber(1000, 'en')).toBe('1,000')
      expect(wexcommerceHelper.formatNumber(1000, 'fr')).toBe('1 000')
      expect(wexcommerceHelper.formatNumber(0, 'en')).toBe('0')
      expect(wexcommerceHelper.formatNumber(999, 'en')).toBe('999')
    })

    it('should format decimal numbers rounded to two decimal places', () => {
      expect(wexcommerceHelper.formatNumber(1234.5, 'en')).toBe('1,234.50')
      expect(wexcommerceHelper.formatNumber(1234.567, 'en')).toBe('1,234.57')
      expect(wexcommerceHelper.formatNumber(1234.5, 'fr')).toBe('1 234.50')
    })

    it('should handle negative and large numbers', () => {
      expect(wexcommerceHelper.formatNumber(-1234.5, 'en')).toBe('-1,234.50')
      expect(wexcommerceHelper.formatNumber(1000000, 'en')).toBe('1,000,000')
      expect(wexcommerceHelper.formatNumber(1000000, 'fr')).toBe('1 000 000')
    })
  })

  describe('formatPrice', () => {
    it('should prefix price with $ when currency is $', () => {
      expect(wexcommerceHelper.formatPrice(100, '$', 'en')).toBe('$100')
      expect(wexcommerceHelper.formatPrice(1234.5, '$', 'en')).toBe('$1,234.50')
    })

    it('should suffix price with currency when currency is not $', () => {
      expect(wexcommerceHelper.formatPrice(100, 'EUR', 'en')).toBe('100 EUR')
      expect(wexcommerceHelper.formatPrice(1234.5, '€', 'fr')).toBe('1 234.50 €')
      expect(wexcommerceHelper.formatPrice(1000, 'MAD', 'en')).toBe('1,000 MAD')
    })
  })

  describe('capitalize', () => {
    it('should capitalize the first character of a string', () => {
      expect(wexcommerceHelper.capitalize('hello world')).toBe('Hello world')
      expect(wexcommerceHelper.capitalize('hello')).toBe('Hello')
      expect(wexcommerceHelper.capitalize('a')).toBe('A')
      expect(wexcommerceHelper.capitalize('Élan')).toBe('Élan')
    })

    it('should return empty string when input is empty', () => {
      expect(wexcommerceHelper.capitalize('')).toBe('')
    })
  })

  describe('joinURL', () => {
    it('should join two URL segments with a single slash', () => {
      expect(wexcommerceHelper.joinURL('http://localhost', 'cdn')).toBe('http://localhost/cdn')
      expect(wexcommerceHelper.joinURL('http://localhost/', 'cdn')).toBe('http://localhost/cdn')
      expect(wexcommerceHelper.joinURL('http://localhost', '/cdn')).toBe('http://localhost/cdn')
      expect(wexcommerceHelper.joinURL('http://localhost/', '/cdn')).toBe('http://localhost/cdn')
    })

    it('should throw an error if either URL segment is missing', () => {
      expect(() => wexcommerceHelper.joinURL(undefined, 'cdn')).toThrow('[joinURL] part undefined')
      expect(() => wexcommerceHelper.joinURL('http://localhost', undefined)).toThrow('[joinURL] part undefined')
      expect(() => wexcommerceHelper.joinURL('', 'cdn')).toThrow('[joinURL] part undefined')
      expect(() => wexcommerceHelper.joinURL('http://localhost', '')).toThrow('[joinURL] part undefined')
    })
  })

  describe('clone and cloneArray', () => {
    it('clone should make a shallow copy of an object', () => {
      const obj = { a: 1, b: 'test' }
      const copy = wexcommerceHelper.clone(obj)
      expect(copy).toEqual(obj)
      expect(copy).not.toBe(obj)

      copy.a = 2
      expect(obj.a).toBe(1)
    })

    it('clone should make a shallow copy of an array', () => {
      const arr = [1, 2, 3]
      const copy = wexcommerceHelper.clone(arr)
      expect(copy).toEqual(arr)
      expect(copy).not.toBe(arr)

      copy[0] = 99
      expect(arr[0]).toBe(1)
    })

    it('cloneArray should clone arrays and preserve null/undefined', () => {
      const arr = ['a', 'b']
      const copy = wexcommerceHelper.cloneArray(arr)
      expect(copy).toEqual(arr)
      expect(copy).not.toBe(arr)

      expect(wexcommerceHelper.cloneArray(undefined as unknown as string[])).toBeUndefined()
      expect(wexcommerceHelper.cloneArray(null as unknown as string[])).toBeNull()
    })
  })

  describe('getPromiseResult', () => {
    it('should return value when promise result status is fulfilled', () => {
      const fulfilledResult: PromiseSettledResult<string> = {
        status: 'fulfilled',
        value: 'success payload',
      }
      expect(wexcommerceHelper.getPromiseResult(fulfilledResult)).toBe('success payload')
    })

    it('should throw reason when promise result status is rejected', () => {
      const rejectedResult: PromiseSettledResult<string> = {
        status: 'rejected',
        reason: 'network error failure',
      }
      expect(() => wexcommerceHelper.getPromiseResult(rejectedResult)).toThrow('network error failure')
    })
  })

  describe('trim helpers', () => {
    it('trimStart should remove leading matching characters', () => {
      expect(wexcommerceHelper.trimStart('/test/', '/')).toBe('test/')
      expect(wexcommerceHelper.trimStart('///test/', '/')).toBe('test/')
      expect(wexcommerceHelper.trimStart('test/', '/')).toBe('test/')
    })

    it('trimEnd should remove trailing matching characters', () => {
      expect(wexcommerceHelper.trimEnd('/test/', '/')).toBe('/test')
      expect(wexcommerceHelper.trimEnd('/test///', '/')).toBe('/test')
      expect(wexcommerceHelper.trimEnd('/test', '/')).toBe('/test')
    })

    it('trim should remove leading and trailing matching characters', () => {
      expect(wexcommerceHelper.trim('/test/', '/')).toBe('test')
      expect(wexcommerceHelper.trim('///test///', '/')).toBe('test')
      expect(wexcommerceHelper.trim('test', '/')).toBe('test')
    })

    it('trimCarriageReturn should remove line breaks and carriage returns', () => {
      expect(wexcommerceHelper.trimCarriageReturn('a\r\nb\nc\r')).toBe('abc')
      expect(wexcommerceHelper.trimCarriageReturn('no line breaks')).toBe('no line breaks')
      expect(wexcommerceHelper.trimCarriageReturn('')).toBe('')
    })
  })

  describe('getDateFormat', () => {
    it('should return French date-fns format string when language is fr', () => {
      expect(wexcommerceHelper.getDateFormat('fr')).toBe('eee d LLLL yyyy, kk:mm')
    })

    it('should return default date-fns format string for non-French languages', () => {
      expect(wexcommerceHelper.getDateFormat('en')).toBe('eee, d LLLL yyyy, kk:mm')
      expect(wexcommerceHelper.getDateFormat('es')).toBe('eee, d LLLL yyyy, kk:mm')
      expect(wexcommerceHelper.getDateFormat('')).toBe('eee, d LLLL yyyy, kk:mm')
    })
  })

  describe('truncateString', () => {
    it('should return original string when string length <= maxLength', () => {
      expect(wexcommerceHelper.truncateString('hello', 10)).toBe('hello')
      expect(wexcommerceHelper.truncateString('hello', 5)).toBe('hello')
      expect(wexcommerceHelper.truncateString('', 5)).toBe('')
    })

    it('should append ellipsis when maxLength >= 6', () => {
      expect(wexcommerceHelper.truncateString('abcdefghij', 8)).toBe('abcde...')
      expect(wexcommerceHelper.truncateString('abcdefghij', 6)).toBe('abc...')
    })

    it('should slice without ellipsis when maxLength < 6', () => {
      expect(wexcommerceHelper.truncateString('abcdefghij', 5)).toBe('abcde')
      expect(wexcommerceHelper.truncateString('abcdefghij', 2)).toBe('ab')
      expect(wexcommerceHelper.truncateString('abcdefghij', 0)).toBe('')
    })
  })
})
