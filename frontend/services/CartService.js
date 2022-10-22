import axios from 'axios';
import Env from '../config/env.config';
import { hasCookie, getCookie, setCookie, deleteCookie } from 'cookies-next';
import UserService from './UserService';

const MAX_AGE = 100 * 365 * 24 * 60 * 60;

export default class CartService {

    static addItem(userId, cartId, productId) {
        const data = { userId, cartId, productId };

        return axios.post(`${Env.API_HOST}/api/add-cart-item`, data).then(res => res.data);
    }

    static updateQuantity(cartItemId, quantity) {
        const data = { quantity };

        return axios.put(`${Env.API_HOST}/api/update-cart-item/${cartItemId}`, data).then(res => res.status);
    }

    static deleteItem(cartItemId) {
        return axios.delete(`${Env.API_HOST}/api/delete-cart-item/${cartItemId}`).then(res => res.status);
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
        const user = UserService.getCurrentUser();
        let key = 'sc-fe-cart';

        if (hasCookie(key)) deleteCookie(key);

        if (user) {
            key += '-';
            key += user.id;
        }
        setCookie(key, id, { maxAge: MAX_AGE });
    }

    static getCartId(context) {
        const _context = context ? { req: context.req, res: context.res } : {};
        const user = UserService.getCurrentUser(_context);
        let key = 'sc-fe-cart';
        if (user) {
            key += '-';
            key += user.id;
        }

        if (hasCookie(key, _context)) return getCookie(key, _context);
        return '';
    }

    static getUserCartId(userId) {
        return axios.get(`${Env.API_HOST}/api/cart-id/${userId}`, { headers: UserService.authHeader() }).then(res => res.data);
    }

    static updateCart(cartId, userId) {
        return axios.put(`${Env.API_HOST}/api/update-cart/${cartId}/${userId}`, null, { headers: UserService.authHeader() }).then(res => res.status);
    }
}