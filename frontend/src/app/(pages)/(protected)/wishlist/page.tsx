'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as WishlistService from '@/lib/WishlistService'
import WishlistComponent, { EmptyWishlist } from '@/components/Wishlist'

const Wishlist = async () => {
  let wishlist: wexcommerceTypes.Wishlist | undefined = undefined

  try {
    const wishlistId = await WishlistService.getWishlistId()

    if (wishlistId) {
      wishlist = await WishlistService.getWishlist(wishlistId)
    }
  } catch (err) {
    console.error(err)
  }

  return wishlist ? (
    <WishlistComponent wishlist={wishlist} />
  ) : (
    <EmptyWishlist />
  )
}

export default Wishlist
