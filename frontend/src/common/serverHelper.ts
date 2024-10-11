import { headers } from 'next/headers'
import slugify from '@sindresorhus/slugify'
import * as wexcommerceTypes from ':wexcommerce-types'

export const getProductURL = (product: wexcommerceTypes.Product) => {
  //
  // Get reverse proxy headers
  //
  const xForwardedProto = headers().get('x-forwarded-proto')
  const xForwardedHost = headers().get('x-forwarded-host')

  let host = ''
  if (xForwardedProto && xForwardedHost) {
    // reverse proxy
    host = `${xForwardedProto}://${xForwardedHost}`
  } else {
    // direct access
    const xURL = headers().get('x-url')
    host = xURL?.match(/((https?:\/\/)|(www.))(?:([a-zA-Z]+)|(\d+\.\d+.\d+.\d+)):\d{4}/g)![0] || ''
  }

  const url = `${host}/product/${product._id}/${slugify(product.name)}`
  return url
}
