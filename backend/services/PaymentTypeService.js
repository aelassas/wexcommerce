import axios from 'axios'
import Env from '../config/env.config'
import * as UserService from './UserService'

export const getPaymentTypes = (context) => (
    axios.get(`${Env.API_HOST}/api/payment-types`, { headers: UserService.authHeader(context) }).then(res => res.data)
)

export const updatePaymentTypes = (data) => (
    axios.put(`${Env.API_HOST}/api/update-payment-types`, data, { headers: UserService.authHeader() }).then(res => res.status)
)