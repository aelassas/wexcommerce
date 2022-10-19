import axios from 'axios';
import Env from '../config/env.config';
import UserService from './UserService';

export default class OrderService {

    static updateOrder(userId, orderId, status) {
        const data = { status };

        return axios.put(`${Env.API_HOST}/api/update-order/${userId}/${orderId}`, data, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static deleteOrder(userId, orderId) {
        return axios.delete(`${Env.API_HOST}/api/delete-order/${userId}/${orderId}`, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static getOrder(context, orderId) {
        return axios.get(`${Env.API_HOST}/api/order/${orderId}`, { headers: UserService.authHeader(context) }).then(res => res.data);
    }

    static getOrders(context, userId, page, size, keyword, paymentTypes, statuses, from, to) {
        const data = { paymentTypes, statuses, from: from || null, to: to || null };

        return axios.post(
            `${Env.API_HOST}/api/orders/${userId}/${page}/${size}${(keyword !== '' && `/?s=${encodeURIComponent(keyword)}` || '')}`
            , data
            , { headers: UserService.authHeader(context) }).then(res => res.data);
    }

}