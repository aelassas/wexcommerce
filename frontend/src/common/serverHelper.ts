import { headers } from 'next/headers'
import slugify from '@sindresorhus/slugify'
import * as wexcommerceTypes from ':wexcommerce-types'

export const getProductURL = (product: wexcommerceTypes.Product) => {
  const xURL = headers().get('x-url')
  const host = headers().get('host')
  const isHTTPS = xURL?.startsWith('https')
  const url = `${isHTTPS ? 'https://' : 'http://'}${host}/product/${product._id}/${slugify(product.name)}`
  return url
}
