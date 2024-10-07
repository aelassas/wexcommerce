'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as PaymentTypeService from '@/lib/PaymentTypeService'
import * as DeliveryTypeService from '@/lib/DeliveryTypeService'
import * as CartService from '@/lib/CartService'
import CheckoutComponent from '@/components/Checkout'
import NoMatch from '@/components/NoMatch'

const Cart = async () => {
  let cart: wexcommerceTypes.Cart | undefined = undefined
  let paymentTypes: wexcommerceTypes.PaymentTypeInfo[] | undefined = undefined
  let deliveryTypes: wexcommerceTypes.DeliveryTypeInfo[] | undefined = undefined

  try {
    paymentTypes = await PaymentTypeService.getPaymentTypes()
    deliveryTypes = await DeliveryTypeService.getDeliveryTypes()
    const cartId = await CartService.getCartId()

    if (cartId) {
      cart = await CartService.getCart(cartId)
    }
  } catch (err) {
    console.error(err)
  }

  return paymentTypes && deliveryTypes ? (
    <CheckoutComponent
      cart={cart}
      paymentTypes={paymentTypes}
      deliveryTypes={deliveryTypes}
    />
  ) : (
    <NoMatch />
  )
}

export default Cart
