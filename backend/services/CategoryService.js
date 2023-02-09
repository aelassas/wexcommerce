import axios from 'axios'
import Env from '../config/env.config'
import * as UserService from './UserService'

export const validate = (data) => (
    axios.post(`${Env.API_HOST}/api/validate-category`, data, { headers: UserService.authHeader() }).then(res => res.status)
)

export const check = (id) => (
    axios.get(`${Env.API_HOST}/api/check-category/${encodeURIComponent(id)}`, { headers: UserService.authHeader() }).then(res => res.status)
)

export const create = (data) => (
    axios.post(`${Env.API_HOST}/api/create-category`, data, { headers: UserService.authHeader() }).then(res => res.status)
)

export const update = (id, data) => (
    axios.put(`${Env.API_HOST}/api/update-category/${id}`, data, { headers: UserService.authHeader() }).then(res => res.status)
)

export const deleteCategory = (id) => (
    axios.delete(`${Env.API_HOST}/api/delete-category/${encodeURIComponent(id)}`, { headers: UserService.authHeader() }).then(res => res.status)
)

export const getCategory = (context, language, id) => (
    axios.get(`${Env.API_HOST}/api/category/${encodeURIComponent(id)}/${language}`, { headers: UserService.authHeader(context) }).then(res => res.data)
)

export const getCategories = (language) => (
    axios.get(`${Env.API_HOST}/api/categories/${language}`).then(res => res.data)
)

export const searchCategories = (context, language, keyword) => (
    axios.get(`${Env.API_HOST}/api/search-categories/${language}/?s=${keyword}`, { headers: UserService.authHeader(context) }).then(res => res.data)
)
