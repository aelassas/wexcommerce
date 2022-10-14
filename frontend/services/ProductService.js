import axios from 'axios';
import Env from '../config/env.config';

export default class ProductService {

    static getProduct(id) {
        return axios.get(`${Env.API_HOST}/api/product/${id}`).then(res => res.data);
    }

    static getProducts(keyword, page, size, categoryId, cartId) {
        const data = { cart: cartId };

        return axios
            .post(
                `${Env.API_HOST}/api/frontend-products/${page}/${size}/${(categoryId && `${categoryId}/`) || ''}${(keyword !== '' && `?s=${encodeURIComponent(keyword)}` || '')}`
                , data)
            .then(res => res.data);
    }
}