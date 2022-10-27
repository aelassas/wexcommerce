import axios from 'axios';
import Env from '../config/env.config';
import UserService from './UserService';

export default class ProductService {

    static uploadImage(file) {
        const user = UserService.getCurrentUser();
        const formData = new FormData();
        formData.append('image', file);
        return axios.post(`${Env.API_HOST}/api/upload-image`, formData,
            user && user.accessToken ? { headers: { 'x-access-token': user.accessToken, 'Content-Type': 'multipart/form-data' } }
                : { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);
    }

    static deleteTempImage(fileName) {
        return axios.post(`${Env.API_HOST}/api/delete-temp-image/${encodeURIComponent(fileName)}`, null, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static deleteImage(productId, fileName) {
        return axios.post(`${Env.API_HOST}/api/delete-image/${productId}/${encodeURIComponent(fileName)}`, null, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static createProduct(data) {
        return axios.post(`${Env.API_HOST}/api/create-product`, data, { headers: UserService.authHeader() }).then(res => ({ status: res.status, data: res.data }));
    }

    static updateProduct(data) {
        return axios.put(`${Env.API_HOST}/api/update-product`, data, { headers: UserService.authHeader() }).then(res => ({ status: res.status, data: res.data }));
    }

    static checkProduct(id) {
        return axios.get(`${Env.API_HOST}/api/check-product/${id}`, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static deleteProduct(id) {
        return axios.delete(`${Env.API_HOST}/api/delete-product/${id}`, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static getProduct(id, language) {
        return axios.post(`${Env.API_HOST}/api/product/${id}/${language}`).then(res => res.data);
    }

    static getProducts(context, userId, keyword, page, size, categoryId) {
        const data = null;

        return axios
            .post(`${Env.API_HOST}/api/backend-products/${userId}/${page}/${size}/${(categoryId && `${categoryId}/`) || ''}${(keyword !== '' && `?s=${encodeURIComponent(keyword)}` || '')}`
                , data
                , { headers: UserService.authHeader(context) }
            )
            .then(res => res.data);
    }

}