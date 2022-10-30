import axios from 'axios';
import Env from '../config/env.config';

export default class SettingService {

    static getLanguage() {
        console.log('SettingService.getLanguage')
        return axios.get(`${Env.API_HOST}/api/language`).then(res => res.data);
    }

    static getCurrency() {
        return axios.get(`${Env.API_HOST}/api/currency`).then(res => res.data);
    }

}