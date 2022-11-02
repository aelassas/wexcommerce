import axios from 'axios';
import Env from '../config/env.config';

export default class DeliveryTypeService {

    static getDeliveryTypes() {
        return axios.get(`${Env.API_HOST}/api/enabled-delivery-types`).then(res => res.data);
    }

}