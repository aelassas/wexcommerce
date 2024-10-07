'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as CartService from '@/lib/CartService'
import CartComponent, { EmptyCart } from '@/components/Cart'

const Cart = async () => {
  let cart: wexcommerceTypes.Cart | undefined = undefined
  console.log('bpooo')
  try {
    const cartId = await CartService.getCartId()
    console.log('cartId', cartId)

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
