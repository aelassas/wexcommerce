import axios from 'axios'
import Env from '../config/env.config'
import * as UserService from './UserService'

export const getLanguage = () => (
    axios.get(`${Env.API_HOST}/api/language`).then(res => res.data)
)

export const getCurrency = () => (
    axios.get(`${Env.API_HOST}/api/currency`).then(res => res.data)
)

export const getSettings = (context) => (
    axios.get(`${Env.API_HOST}/api/settings`, { headers: UserService.authHeader(context) }).then(res => res.data)
)

export const updateSettings = (data) => (
    axios.put(`${Env.API_HOST}/api/update-settings`, data, { headers: UserService.authHeader() }).then(res => res.status)
)

export const updateBankSettings = (data) => (
    axios.put(`${Env.API_HOST}/api/update-bank-settings`, data, { headers: UserService.authHeader() }).then(res => res.status)
)