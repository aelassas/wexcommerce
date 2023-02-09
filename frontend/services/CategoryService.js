import axios from 'axios'
import Env from '../config/env.config'

export const getCategories = (language) => (
    axios.get(`${Env.API_HOST}/api/categories/${language}`).then(res => res.data)
)