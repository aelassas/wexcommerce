import { toast } from 'react-toastify'
import * as wexcommerceTypes from ':wexcommerce-types'
import { strings as commonStrings } from '@/lang/common'
import { strings as osStrings } from '@/lang/order-status'
import { LocalizedStrings } from 'react-localization'

export const info = (message: string) => {
  toast.info(message)
}

export const error = (err?: unknown, message?: string) => {
  if (err && console && console.error) {
    console.error(err)
  }
  if (message) {
    toast.error(message)
  } else {
    toast.error(commonStrings.GENERIC_ERROR)
  }
}

export const setLanguage = (strings: LocalizedStrings<any>, language: string) => {
  strings.setLanguage(language)
}

export const getPaymentTypes = () => {
  return [
    wexcommerceTypes.PaymentType.CreditCard,
    wexcommerceTypes.PaymentType.Cod, wexcommerceTypes.PaymentType.WireTransfer,
  ]
}

export const getPaymentType = (paymentType: wexcommerceTypes.PaymentType, language: string) => {
  setLanguage(commonStrings, language)

  return paymentType === wexcommerceTypes.PaymentType.CreditCard ? commonStrings.CREDIT_CARD
    : paymentType === wexcommerceTypes.PaymentType.Cod ? commonStrings.COD
      : paymentType === wexcommerceTypes.PaymentType.WireTransfer ? commonStrings.WIRE_TRANSFER
        : ''
}

export const getOrderStatuses = () => {
  return [
    wexcommerceTypes.OrderStatus.Pending,
    wexcommerceTypes.OrderStatus.Paid,
    wexcommerceTypes.OrderStatus.Confirmed,
    wexcommerceTypes.OrderStatus.InProgress,
    wexcommerceTypes.OrderStatus.Shipped,
    wexcommerceTypes.OrderStatus.Cancelled,
  ]
}


export const getOrderStatus = (orderStatus: wexcommerceTypes.OrderStatus, language: string) => {
  setLanguage(osStrings, language)

  return orderStatus === wexcommerceTypes.OrderStatus.Pending ? osStrings.PENDING
    : orderStatus === wexcommerceTypes.OrderStatus.Paid ? osStrings.PAID
      : orderStatus === wexcommerceTypes.OrderStatus.Confirmed ? osStrings.CONFIRMED
        : orderStatus === wexcommerceTypes.OrderStatus.InProgress ? osStrings.IN_PROGRESS
          : orderStatus === wexcommerceTypes.OrderStatus.Shipped ? osStrings.SHIPPED
            : orderStatus === wexcommerceTypes.OrderStatus.Cancelled ? osStrings.CANCELLED
              : ''
}

export const getDeliveryTypes = () => {
  return [
    wexcommerceTypes.DeliveryType.Shipping,
    wexcommerceTypes.DeliveryType.Withdrawal,
  ]
}

export const getDeliveryType = (deliveryType: wexcommerceTypes.DeliveryType, language: string) => {
  setLanguage(commonStrings, language)

  return deliveryType === wexcommerceTypes.DeliveryType.Shipping ? commonStrings.SHIPPING
    : deliveryType === wexcommerceTypes.DeliveryType.Withdrawal ? commonStrings.WITHDRAWAL
      : ''
}

export const total = (cartItems:wexcommerceTypes.CartItem[]) => {
  let total = 0
  for (const item of cartItems) {
    if (!item.product.soldOut) {
      total += item.product.price * item.quantity
    }
  }
  return total
}
