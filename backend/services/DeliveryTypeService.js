import axios from 'axios';
import Env from '../config/env.config';
import UserService from './UserService';

export default class DeliveryTypeService {

    static getDeliveryTypes(context) {
        return axios.get(`${Env.API_HOST}/api/delivery-types`, { headers: UserService.authHeader(context) }).then(res => res.data);
    }

    static updateDeliveryTypes(data) {
        return axios.put(`${Env.API_HOST}/api/update-delivery-types`, data, { headers: UserService.authHeader() }).then(res => res.status);
    }

}