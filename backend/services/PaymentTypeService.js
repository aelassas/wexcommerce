import axios from 'axios';
import Env from '../config/env.config';
import UserService from './UserService';

export default class PaymentTypeService {

    static getPaymentTypes(context) {
        return axios.get(`${Env.API_HOST}/api/payment-types`, { headers: UserService.authHeader(context) }).then(res => res.data);
    }

    static updatePaymentTypes(data) {
        return axios.put(`${Env.API_HOST}/api/update-payment-types`, data, { headers: UserService.authHeader() }).then(res => res.status);
    }

}