'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as CartService from '@/lib/CartService'
import CartComponent, { EmptyCart } from '@/components/Cart'

const Cart = async () => {
  let cart: wexcommerceTypes.Cart | undefined = undefined

  try {
    const cartId = await CartService.getCartId()

    if (cartId) {
      cart = await CartService.getCart(cartId)
    }
  } catch (err) {
    console.error(err)
  }

  return cart ? (
    <CartComponent cart={cart} />
  ) : (
    <EmptyCart />
  )
}

export default Cart
