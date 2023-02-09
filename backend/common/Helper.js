import { toast } from 'react-toastify'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings as osStrings } from '../lang/order-status'

export const info = (msg) => {
    toast(msg, { type: 'info' })
}

export const error = (msg) => {
    toast(msg || commonStrings.GENERIC_ERROR, { type: 'error' })
}

export const setLanguage = (strings, language) => {
    strings.setLanguage(language)
}

export const joinURL = (part1, part2) => {
    if (part1.charAt(part1.length - 1) === '/') {
        part1 = part1.substr(0, part1.length - 1)
    }
    if (part2.charAt(0) === '/') {
        part2 = part2.substr(1)
    }
    return part1 + '/' + part2
}

export const clone = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

export const cloneArray = (arr) => {
    if (typeof arr === 'undefined') return undefined
    if (arr == null) return null
    return [...arr]
}

export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const getPaymentTypes = () => {
    return [Env.PAYMENT_TYPE.CREDIT_CARD, Env.PAYMENT_TYPE.COD, Env.PAYMENT_TYPE.WIRE_TRANSFER]
}

export const getPaymentType = (paymentType, language) => {
    setLanguage(commonStrings, language)

    return paymentType === Env.PAYMENT_TYPE.CREDIT_CARD ? commonStrings.CREDIT_CARD
        : paymentType === Env.PAYMENT_TYPE.COD ? commonStrings.COD
            : paymentType === Env.PAYMENT_TYPE.WIRE_TRANSFER ? commonStrings.WIRE_TRANSFER
                : ''
}

export const getOrderStatuses = () => {
    return [
        Env.ORDER_STATUS.PENDING,
        Env.ORDER_STATUS.PAID,
        Env.ORDER_STATUS.CONFIRMED,
        Env.ORDER_STATUS.IN_PROGRESS,
        Env.ORDER_STATUS.SHIPPED,
        Env.ORDER_STATUS.CANCELLED
    ]
}


export const getOrderStatus = (orderStatus, language) => {
    setLanguage(osStrings, language)

    return orderStatus === Env.ORDER_STATUS.PENDING ? osStrings.PENDING
        : orderStatus === Env.ORDER_STATUS.PAID ? osStrings.PAID
            : orderStatus === Env.ORDER_STATUS.CONFIRMED ? osStrings.CONFIRMED
                : orderStatus === Env.ORDER_STATUS.IN_PROGRESS ? osStrings.IN_PROGRESS
                    : orderStatus === Env.ORDER_STATUS.SHIPPED ? osStrings.SHIPPED
                        : orderStatus === Env.ORDER_STATUS.CANCELLED ? osStrings.CANCELLED
                            : ''
}

export const formatNumber = (x) => {
    const parts = x.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    return parts.join(".")
}

export const getDeliveryTypes = () => {
    return [Env.DELIVERY_TYPE.SHIPPING, Env.DELIVERY_TYPE.WITHDRAWAL]
}

export const getDeliveryType = (deliveryType, language) => {
    setLanguage(commonStrings, language)

    return deliveryType === Env.DELIVERY_TYPE.SHIPPING ? commonStrings.SHIPPING
        : deliveryType === Env.DELIVERY_TYPE.WITHDRAWAL ? commonStrings.WITHDRAWAL
            : ''
}