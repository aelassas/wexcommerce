import axios from 'axios'
import Env from '../config/env.config'
import { hasCookie, getCookie, setCookie, deleteCookie } from 'cookies-next'
import * as UserService from './UserService'

export const addItem = (cartId, userId, productId) => {
    const data = { cartId, userId, productId }

    return axios.post(`${Env.API_HOST}/api/add-cart-item`, data).then(res => ({ status: res.status, data: res.data }))
}

export const updateQuantity = (cartItemId, quantity) => (
    axios.put(`${Env.API_HOST}/api/update-cart-item/${cartItemId}/${quantity}`, null).then(res => res.status)
)

export const deleteItem = (cartId, productId) => (
    axios.delete(`${Env.API_HOST}/api/delete-cart-item/${cartId}/${productId}`).then(res => ({ status: res.status, data: res.data }))
)

export const clearCart = (cartId) => (
    axios.delete(`${Env.API_HOST}/api/delete-cart/${cartId}`).then(res => res.status)
)

export const getCart = (cartId) => (
    axios.get(`${Env.API_HOST}/api/cart/${cartId}`).then(res => res.data)
)

export const getCartCount = (cartId) => (
    axios.get(`${Env.API_HOST}/api/cart-count/${cartId}`).then(res => res.data)
)

export const setCartId = (id) => {
    setCookie('wc-fe-cart', id, Env.COOCKIES_OPTIONS)
}

export const getCartId = (context) => {
    const _context = context ? { req: context.req, res: context.res } : {}
    let key = 'wc-fe-cart'

    if (hasCookie(key, _context)) return getCookie(key, _context)
    return ''
}

export const deleteCartId = (context) => {
    const _context = context ? { req: context.req, res: context.res } : {}
    let key = 'wc-fe-cart'

    if (hasCookie(key, _context)) return deleteCookie(key, _context)
    return ''
}

export const getUserCartId = (userId) => (
    axios.get(`${Env.API_HOST}/api/cart-id/${userId}`, { headers: UserService.authHeader() }).then(res => res.data)
)

export const updateCart = (cartId, userId) => (
    axios.put(`${Env.API_HOST}/api/update-cart/${cartId}/${userId}`, null, { headers: UserService.authHeader() }).then(res => res.status)
)
