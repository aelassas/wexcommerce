import axios from 'axios';
import Env from '../config/env.config';
import UserService from './UserService';

export default class SettingService {

    static getLanguage() {
        console.log('SettingService.getLanguage')
        return axios.get(`${Env.API_HOST}/api/language`).then(res => res.data);
    }

    static getCurrency() {
        return axios.get(`${Env.API_HOST}/api/currency`).then(res => res.data);
    }

    static getSettings(context) {
        return axios.get(`${Env.API_HOST}/api/settings`, { headers: UserService.authHeader(context) }).then(res => res.data);
    }

    static updateSettings(data) {
        return axios.put(`${Env.API_HOST}/api/update-settings`, data, { headers: UserService.authHeader() }).then(res => res.status);
    }

    static updateBankSettings(data) {
        return axios.put(`${Env.API_HOST}/api/update-bank-settings`, data, { headers: UserService.authHeader() }).then(res => res.status);
    }

}