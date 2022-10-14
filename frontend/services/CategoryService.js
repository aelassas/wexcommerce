import axios from 'axios';
import Env from '../config/env.config';

export default class CategoryService {

    static getCategories(language) {
        return axios.get(`${Env.API_HOST}/api/categories/${language}`).then(res => res.data);
    }
}