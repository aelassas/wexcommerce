'use server'

import { Suspense } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as CartService from '@/lib/CartService'
import CartComponent, { EmptyCart } from '@/components/Cart'
import Indicator from '@/components/Indicator'

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
    <Suspense fallback={<Indicator />}>
      <CartComponent cart={cart} />
    </Suspense>
  ) : (
    <EmptyCart />
  )
}

export default Cart
