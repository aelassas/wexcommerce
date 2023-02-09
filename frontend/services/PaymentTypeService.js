import axios from 'axios'
import Env from '../config/env.config'

export const getPaymentTypes = () => (
    axios.get(`${Env.API_HOST}/api/enabled-payment-types`).then(res => res.data)
)