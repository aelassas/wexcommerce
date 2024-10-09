'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import NoMatch from '@/components/NoMatch'
import * as SettingService from '@/lib/SettingService'
import * as CartService from '@/lib/CartService'
import * as ProductService from '@/lib/ProductService'
import ProductComponent from '@/components/Product'

const Product = async ({ params }: { params: { id: string, name: string } }) => {
  const { id } = params

  if (!id) {
    return (
      <NoMatch />
    )
  }

  let product: wexcommerceTypes.Product | undefined = undefined
  try {
    const language = await SettingService.getLanguage()
    const cartId = await CartService.getCartId()
    product = await ProductService.getProduct(id, language, cartId)
  } catch (err) {
    console.error(err)
  }

  return product ? (
    <ProductComponent product={product} />
  ) : (
    <NoMatch />
  )
}

export default Product
