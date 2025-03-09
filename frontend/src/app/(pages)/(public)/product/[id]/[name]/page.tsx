import React, { Suspense } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import NoMatch from '@/components/NoMatch'
import * as SettingService from '@/lib/SettingService'
import * as ProductService from '@/lib/ProductService'
import * as CartService from '@/lib/CartService'
import * as UserService from '@/lib/UserService'
import * as WishlistService from '@/lib/WishlistService'
import ProductComponent from '@/components/Product'
import Indicator from '@/components/Indicator'
import ScrollToTop from '@/components/ScrollToTop'

const Product = async (props: { params: Promise<{ id: string, name: string }> }) => {
  const params = await props.params
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
    const userId = await UserService.getUserId()
    const wishlistId = await WishlistService.getWishlistId(userId)
    product = await ProductService.getProduct(id, language, cartId, wishlistId)
  } catch (err) {
    console.error(err)
  }

  return (
    <>
      <ScrollToTop />

      {
        product ? (
          <Suspense fallback={<Indicator />}>
            <ProductComponent product={product} />
          </Suspense>
        ) : (
          <NoMatch />
        )
      }
    </>
  )
}

export default Product
