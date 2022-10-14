import axios from 'axios';
import Env from '../config/env.config';
import UserService from './UserService';

export default class CategoryService {

    static validate(data) {
        return axios.post(`${Env.API_HOST}/api/validate-category`, data, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static check(id) {
        return axios.get(`${Env.API_HOST}/api/check-category/${encodeURIComponent(id)}`, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static create(data) {
        return axios.post(`${Env.API_HOST}/api/create-category`, data, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static update(id, data) {
        return axios.put(`${Env.API_HOST}/api/update-category/${id}`, data, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static delete(id) {
        return axios.delete(`${Env.API_HOST}/api/delete-category/${encodeURIComponent(id)}`, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static getCategory(context, language, id) {
        return axios.get(`${Env.API_HOST}/api/category/${encodeURIComponent(id)}/${language}`, { headers: UserService.authHeader(context) }).then(res => res.data);
    }

    static getCategories(language) {
        return axios.get(`${Env.API_HOST}/api/categories/${language}`).then(res => res.data);
    }

    static searchCategories(context, language, keyword) {
        return axios.get(`${Env.API_HOST}/api/search-categories/${language}/?s=${keyword}`, { headers: UserService.authHeader(context) }).then(res => res.data);
    }
}