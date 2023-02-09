import axios from 'axios'
import Env from '../config/env.config'

export const getDeliveryTypes = () => (
    axios.get(`${Env.API_HOST}/api/enabled-delivery-types`).then(res => res.data)
)