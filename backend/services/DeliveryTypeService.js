import axios from 'axios'
import Env from '../config/env.config'
import * as UserService from './UserService'

export const getDeliveryTypes = (context) => (
    axios.get(`${Env.API_HOST}/api/delivery-types`, { headers: UserService.authHeader(context) }).then(res => res.data)
)

export const updateDeliveryTypes = (data) => (
    axios.put(`${Env.API_HOST}/api/update-delivery-types`, data, { headers: UserService.authHeader() }).then(res => res.status)
)