import axios from 'axios';
import Env from '../config/env.config';
import { hasCookie, getCookie, setCookie, deleteCookie } from 'cookies-next';

export default class UserService {

    static authHeader(context) {
        let user;
        const _context = context ? { req: context.req, res: context.res } : {};
        if (hasCookie('sc-be-user', _context)) user = JSON.parse(getCookie('sc-be-user', _context));

        if (user && user.accessToken) {
            return { 'x-access-token': user.accessToken };
        } else {
            return {};
        }
    }

    static signup(data) {
        return axios.post(`${Env.API_HOST}/api/admin-sign-up/ `, data).then(res => res.status);
    }

    static validateEmail(data) {
        return axios.post(`${Env.API_HOST}/api/validate-email`, data).then(res => res.status);
    }

    static isAdmin(data) {
        return axios.post(`${Env.API_HOST}/api/is-admin`, data).then(res => res.status);
    }

    static signin(data) {
        return axios.post(`${Env.API_HOST}/api/sign-in/${Env.APP_TYPE}`, data).then(res => {
            if (res.data.accessToken) {
                setCookie('sc-be-user', JSON.stringify(res.data), Env.COOCKIES_OPTIONS);
            }
            return { status: res.status, data: res.data };
        });
    }

    static signout(redirect = true) {
        deleteCookie('sc-be-user');

        if (redirect) {
            const url = new URL(window.location.href);

            if (url.searchParams.has('o')) {
                window.location.href = `/sign-in?o=${url.searchParams.get('o')}`;
            } else {
                window.location.href = '/sign-in';
            }

        }
    }

    static validateAccessToken(context) {
        return axios.post(`${Env.API_HOST}/api/validate-access-token`, null, { headers: UserService.authHeader(context) }).then(res => res.status);
    }

    static resendLink(data) {
        return axios.post(`${Env.API_HOST}/api/resend-link`, data, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static resend(email, reset = false) {
        return axios.post(`${Env.API_HOST}/api/resend/${Env.APP_TYPE}/${encodeURIComponent(email)}/${reset}`).then(res => res.status);
    }

    static activate(data) {
        return axios.post(`${Env.API_HOST}/api/activate/ `, data, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static checkToken(userId, email, token) {
        return axios.get(`${Env.API_HOST}/api/check-token/${Env.APP_TYPE}/${encodeURIComponent(userId)}/${encodeURIComponent(email)}/${encodeURIComponent(token)}`).then(res => res.status);
    }

    static deleteTokens(userId) {
        return axios.delete(`${Env.API_HOST}/api/delete-tokens/${encodeURIComponent(userId)}`).then(res => res.status);
    }

    static getLanguage(context) {
        console.log('UserService.getLanguage')
        let user;
        const _context = context ? { req: context.req, res: context.res } : {};
        if (hasCookie('sc-be-user', _context)) user = JSON.parse(getCookie('sc-be-user', _context));

        if (user && user.language) {
            return user.language;
        } else {
            let lang;
            if (hasCookie('sc-be-language', _context)) lang = JSON.parse(getCookie('sc-be-language', _context));

            if (lang && lang.length === 2) {
                return lang;
            }
            return Env.DEFAULT_LANGUAGE;
        }
    };

    static updateLanguage(data) {
        return axios.post(`${Env.API_HOST}/api/update-language`, data, { headers: UserService.authHeader() }).then(res => {
            if (res.status === 200) {
                let user;
                if (hasCookie('sc-be-user')) user = JSON.parse(getCookie('sc-be-user'));
                if (user) {
                    user.language = data.language;
                    setCookie('sc-be-user', JSON.stringify(user), Env.COOCKIES_OPTIONS);
                }
            }
            return res.status;
        })
    }

    static setLanguage(lang) {
        setCookie('sc-be-language', JSON.stringify(lang), Env.COOCKIES_OPTIONS);
    }

    static getCurrentUser(context) {
        let user;
        const _context = context ? { req: context.req, res: context.res } : {};
        if (hasCookie('sc-be-user', _context)) user = JSON.parse(getCookie('sc-be-user', _context));

        if (user && user.accessToken) {
            return user;
        }
        return null;
    };

    static getUser(context, id) {
        return axios.get(`${Env.API_HOST}/api/user/` + encodeURIComponent(id), { headers: UserService.authHeader(context) }).then(res => res.data);
    }

    static getUsers(context, keyword, page, size) {
        return axios.get(`${Env.API_HOST}/api/users/${page}/${size}/${UserService.getLanguage(context)}/?s=${encodeURIComponent(keyword)}`, { headers: UserService.authHeader(context) }).then(res => res.data);
    }

    static updateUser(data) {
        return axios.post(`${Env.API_HOST}/api/update-user`, data, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static checkPassword(id, pass) {
        return axios.get(`${Env.API_HOST}/api/check-password/${encodeURIComponent(id)}/${encodeURIComponent(pass)}`, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static changePassword(data) {
        return axios.post(`${Env.API_HOST}/api/change-password/ `, data, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static delete(ids) {
        return axios.post(`${Env.API_HOST}/api/delete-users`, ids, { headers: UserService.authHeader() }).then(res => res.status);
    }
}