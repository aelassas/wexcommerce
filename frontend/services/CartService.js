import axios from 'axios';
import Env from '../config/env.config';
import { hasCookie, getCookie, setCookie, deleteCookie } from 'cookies-next';
import UserService from './UserService';

const MAX_AGE = 100 * 365 * 24 * 60 * 60;

export default class CartService {

    static addItem(cartId, userId, productId) {
        const data = { cartId, userId, productId };

        return axios.post(`${Env.API_HOST}/api/add-cart-item`, data).then(res => ({ status: res.status, data: res.data }));
    }

    static updateQuantity(cartId, productId, quantity) {
        return axios.put(`${Env.API_HOST}/api/update-cart-item/${cartId}/${productId}/${quantity}`, null).then(res => res.status);
    }

    static deleteItem(cartId, productId) {
        return axios.delete(`${Env.API_HOST}/api/delete-cart-item/${cartId}/${productId}`).then(res => ({ status: res.status, data: res.data }));
    }

    static clearCart(cartId) {
        return axios.delete(`${Env.API_HOST}/api/delete-cart/${cartId}`).then(res => res.status);
    }

    static getCart(cartId) {
        return axios.get(`${Env.API_HOST}/api/cart/${cartId}`).then(res => res.data);
    }

    static getCartCount(cartId) {
        return axios.get(`${Env.API_HOST}/api/cart-count/${cartId}`).then(res => res.data);
    }

    static setCartId(id) {
        setCookie('sc-fe-cart', id, { maxAge: MAX_AGE });
    }

    static getCartId(context) {
        const _context = context ? { req: context.req, res: context.res } : {};
        let key = 'sc-fe-cart';

        if (hasCookie(key, _context)) return getCookie(key, _context);
        return '';
    }

    static deleteCartId(context) {
        const _context = context ? { req: context.req, res: context.res } : {};
        let key = 'sc-fe-cart';

        if (hasCookie(key, _context)) return deleteCookie(key, _context);
        return '';
    }

    static getUserCartId(userId) {
        return axios.get(`${Env.API_HOST}/api/cart-id/${userId}`, { headers: UserService.authHeader() }).then(res => res.data);
    }

    static updateCart(cartId, userId) {
        return axios.put(`${Env.API_HOST}/api/update-cart/${cartId}/${userId}`, null, { headers: UserService.authHeader() }).then(res => res.status);
    }
}