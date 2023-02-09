import axios from 'axios'
import Env from '../config/env.config'
import * as UserService from './UserService'

export const uploadImage = (file) => {
    const user = UserService.getCurrentUser()
    const formData = new FormData()
    formData.append('image', file)
    return axios.post(`${Env.API_HOST}/api/upload-image`, formData,
        user && user.accessToken ? { headers: { 'x-access-token': user.accessToken, 'Content-Type': 'multipart/form-data' } }
            : { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data)
}

export const deleteTempImage = (fileName) => (
    axios.post(`${Env.API_HOST}/api/delete-temp-image/${encodeURIComponent(fileName)}`, null, { headers: UserService.authHeader() }).then(res => res.status)
)

export const deleteImage = (productId, fileName) => (
    axios.post(`${Env.API_HOST}/api/delete-image/${productId}/${encodeURIComponent(fileName)}`, null, { headers: UserService.authHeader() }).then(res => res.status)
)

export const createProduct = (data) => (
    axios.post(`${Env.API_HOST}/api/create-product`, data, { headers: UserService.authHeader() }).then(res => ({ status: res.status, data: res.data }))
)

export const updateProduct = (data) => (
    axios.put(`${Env.API_HOST}/api/update-product`, data, { headers: UserService.authHeader() }).then(res => ({ status: res.status, data: res.data }))
)

export const checkProduct = (id) => (
    axios.get(`${Env.API_HOST}/api/check-product/${id}`, { headers: UserService.authHeader() }).then(res => res.status)
)

export const deleteProduct = (id) => (
    axios.delete(`${Env.API_HOST}/api/delete-product/${id}`, { headers: UserService.authHeader() }).then(res => res.status)
)

export const getProduct = (id, language) => (
    axios.post(`${Env.API_HOST}/api/product/${id}/${language}`).then(res => res.data)
)

export const getProducts = (context, userId, keyword, page, size, categoryId) => {
    const data = null

    return axios
        .post(`${Env.API_HOST}/api/backend-products/${userId}/${page}/${size}/${(categoryId && `${categoryId}/`) || ''}${(keyword !== '' && `?s=${encodeURIComponent(keyword)}` || '')}`
            , data
            , { headers: UserService.authHeader(context) }
        )
        .then(res => res.data)
}