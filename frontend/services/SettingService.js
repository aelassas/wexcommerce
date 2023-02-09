import axios from 'axios'
import Env from '../config/env.config'

export const getLanguage = () => {
    return axios.get(`${Env.API_HOST}/api/language`).then(res => res.data)
}

export const getCurrency = () => {
    return axios.get(`${Env.API_HOST}/api/currency`).then(res => res.data)
}