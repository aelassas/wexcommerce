import React, { Suspense } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as serverHelper from '@/utils/serverHelper'
import * as UserService from '@/lib/UserService'
import * as WishlistService from '@/lib/WishlistService'
import * as CartService from '@/lib/CartService'
import WishlistComponent, { EmptyWishlist } from '@/components/Wishlist'
import Indicator from '@/components/Indicator'
import ScrollToTop from '@/components/ScrollToTop'

const Wishlist = async () => {
  let wishlist: wexcommerceTypes.Wishlist | undefined = undefined

  try {
    const userId = await UserService.getUserId()
    const wishlistId = await WishlistService.getWishlistId(userId!)
    const cartId = await CartService.getCartId()

    if (wishlistId) {
      wishlist = await WishlistService.getWishlist(wishlistId, cartId)

      for (const product of wishlist.products) {
        product.url = await serverHelper.getProductURL(product)
      }
    }
  } catch (err) {
    console.error(err)
  }

  return (
    <>
      <ScrollToTop />

      {wishlist ? (
        <Suspense fallback={<Indicator />}>
          <WishlistComponent wishlist={wishlist} />
        </Suspense>
      ) : (
        <EmptyWishlist />
      )}
    </>
  )
}

export default Wishlist
