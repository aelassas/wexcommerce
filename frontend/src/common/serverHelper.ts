import { headers } from 'next/headers'
import slugify from '@sindresorhus/slugify'
import * as wexcommerceTypes from ':wexcommerce-types'

export const getProductURL = async (product: wexcommerceTypes.Product) => {
  //
  // Get reverse proxy headers
  //
  const headersList = await headers()
  const xForwardedProto = headersList.get('x-forwarded-proto')
  const xForwardedHost = headersList.get('x-forwarded-host')

  let host = ''
  if (xForwardedProto && xForwardedHost) {
    // reverse proxy
    host = `${xForwardedProto}://${xForwardedHost}`
  } else {
    // direct access
    const xURL = headersList.get('x-url')
    host = xURL?.match(/((https?:\/\/)|(www.))(?:([a-zA-Z]+)|(\d+\.\d+.\d+.\d+)):\d{4}/g)![0] || ''
  }

  const url = `${host}/product/${product._id}/${slugify(product.name)}`
  return url
}
