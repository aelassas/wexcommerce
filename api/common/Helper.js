import Env from "../config/env.config.js";

export default class Helper {

    static joinURL(part1, part2) {
        if (part1.charAt(part1.length - 1) === '/') {
            part1 = part1.substr(0, part1.length - 1);
        }
        if (part2.charAt(0) === '/') {
            part2 = part2.substr(1);
        }
        return part1 + '/' + part2;
    }

    static clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static formatNumber(x) {
        const parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }

};