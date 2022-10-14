import { toast } from 'react-toastify';
import { strings as commonStrings } from '../lang/common';
import UserService from '../services/UserService';

export const info = (msg) => {
    toast(msg, { type: 'info' });
};

export const error = (msg) => {
    toast(msg || commonStrings.GENERIC_ERROR, { type: 'error' });
};

export const setLanguage = (strings) => {
    strings.setLanguage(UserService.getLanguage());
};

export const joinURL = (part1, part2) => {
    if (part1.charAt(part1.length - 1) === '/') {
        part1 = part1.substr(0, part1.length - 1);
    }
    if (part2.charAt(0) === '/') {
        part2 = part2.substr(1);
    }
    return part1 + '/' + part2;
};

export const clone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
