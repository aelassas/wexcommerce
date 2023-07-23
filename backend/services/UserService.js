import axios from 'axios'
import Env from '../config/env.config'
import { hasCookie, getCookie, setCookie, deleteCookie } from 'cookies-next'

export const authHeader = (context) => {
    let user
    const _context = context ? { req: context.req, res: context.res } : {}
    if (hasCookie('wc-be-user', _context)) user = JSON.parse(getCookie('wc-be-user', _context))

    if (user && user.accessToken) {
        return { 'x-access-token': user.accessToken }
    } else {
        return {}
    }
}

export const signup = (data) => (
    axios.post(`${Env.API_HOST}/api/admin-sign-up/ `, data).then(res => res.status)
)

export const validateEmail = (data) => (
    axios.post(`${Env.API_HOST}/api/validate-email`, data).then(res => res.status)
)

export const isAdmin = (data) => (
    axios.post(`${Env.API_HOST}/api/is-admin`, data).then(res => res.status)
)

export const signin = (data) => (
    axios.post(`${Env.API_HOST}/api/sign-in/${Env.APP_TYPE}`, data).then(res => {
        if (res.data.accessToken) {
            setCookie('wc-be-user', JSON.stringify(res.data), Env.COOCKIES_OPTIONS)
        }
        return { status: res.status, data: res.data }
    })
)

export const signout = (redirect = true) => {
    deleteCookie('wc-be-user')

    if (redirect) {
        const url = new URL(window.location.href)

        if (url.searchParams.has('o')) {
            window.location.href = `/sign-in?o=${url.searchParams.get('o')}`
        } else {
            window.location.href = '/sign-in'
        }

    }
}

export const validateAccessToken = (context) => (
    axios.post(`${Env.API_HOST}/api/validate-access-token`, null, { headers: authHeader(context) }).then(res => res.status)
)

export const resendLink = (data) => (
    axios.post(`${Env.API_HOST}/api/resend-link`, data, { headers: authHeader() }).then(res => res.status)
)

export const resend = (email, reset = false) => (
    axios.post(`${Env.API_HOST}/api/resend/${Env.APP_TYPE}/${encodeURIComponent(email)}/${reset}`).then(res => res.status)
)

export const activate = (data) => (
    axios.post(`${Env.API_HOST}/api/activate/ `, data, { headers: authHeader() }).then(res => res.status)
)

export const checkToken = (userId, email, token) => (
    axios.get(`${Env.API_HOST}/api/check-token/${Env.APP_TYPE}/${encodeURIComponent(userId)}/${encodeURIComponent(email)}/${encodeURIComponent(token)}`).then(res => res.status)
)

export const deleteTokens = (userId) => (
    axios.delete(`${Env.API_HOST}/api/delete-tokens/${encodeURIComponent(userId)}`).then(res => res.status)
)

export const getLanguage = (context) => {
    let user
    const _context = context ? { req: context.req, res: context.res } : {}
    if (hasCookie('wc-be-user', _context)) user = JSON.parse(getCookie('wc-be-user', _context))

    if (user && user.language) {
        return user.language
    } else {
        console.log('wc-be-language')
        let lang
        if (hasCookie('wc-be-language', _context)) lang = JSON.parse(getCookie('wc-be-language', _context))

        if (lang && lang.length === 2) {
            return lang
        }
        return Env.DEFAULT_LANGUAGE
    }
}

export const updateLanguage = (data) => {
    return axios.post(`${Env.API_HOST}/api/update-language`, data, { headers: authHeader() }).then(res => {
        if (res.status === 200) {
            let user
            if (hasCookie('wc-be-user')) user = JSON.parse(getCookie('wc-be-user'))
            if (user) {
                user.language = data.language
                setCookie('wc-be-user', JSON.stringify(user), Env.COOCKIES_OPTIONS)
            }
        }
        return res.status
    })
}

export const setLanguage = (lang) => {
    setCookie('wc-be-language', JSON.stringify(lang), Env.COOCKIES_OPTIONS)
}

export const getCurrentUser = (context) => {
    let user
    const _context = context ? { req: context.req, res: context.res } : {}
    if (hasCookie('wc-be-user', _context)) user = JSON.parse(getCookie('wc-be-user', _context))

    if (user && user.accessToken) {
        return user
    }
    return null
}

export const getUser = (context, id) => (
    axios.get(`${Env.API_HOST}/api/user/` + encodeURIComponent(id), { headers: authHeader(context) }).then(res => res.data)
)

export const getUsers = (context, keyword, page, size) => (
    axios.get(`${Env.API_HOST}/api/users/${page}/${size}/${getLanguage(context)}/?s=${encodeURIComponent(keyword)}`, { headers: authHeader(context) }).then(res => res.data)
)

export const updateUser = (data) => (
    axios.post(`${Env.API_HOST}/api/update-user`, data, { headers: authHeader() }).then(res => res.status)
)

export const checkPassword = (id, pass) => (
    axios.get(`${Env.API_HOST}/api/check-password/${encodeURIComponent(id)}/${encodeURIComponent(pass)}`, { headers: authHeader() }).then(res => res.status)
)

export const changePassword = (data) => (
    axios.post(`${Env.API_HOST}/api/change-password/ `, data, { headers: authHeader() }).then(res => res.status)
)

export const deleteUsers = (ids) => (
    axios.post(`${Env.API_HOST}/api/delete-users`, ids, { headers: authHeader() }).then(res => res.status)
)