import axios from 'axios'
import Env from '../config/env.config'

export const getProduct = (id, _language, cartId) => {
    const data = { cart: cartId }

    return axios.post(`${Env.API_HOST}/api/product/${id}/${_language}`, data).then(res => res.data)
}

export const getProducts = (keyword, page, size, categoryId, cartId) => {
    const data = { cart: cartId }

    return axios
        .post(
            `${Env.API_HOST}/api/frontend-products/${page}/${size}/${(categoryId && `${categoryId}/`) || ''}${(keyword !== '' && `?s=${encodeURIComponent(keyword)}` || '')}`
            , data)
        .then(res => res.data)
}