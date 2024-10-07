import cors from 'cors';
import * as helper from "../common/helper.js";
import * as env from "../config/env.config.js";
import * as logger from "../common/logger.js";
const whitelist = [helper.trimEnd(env.BACKEND_HOST, '/'), helper.trimEnd(env.FRONTEND_HOST, '/')];
/**
 * CORS configuration.
 *
 * @type {cors.CorsOptions}
 */
const CORS_CONFIG = {
  origin(origin, callback) {
    if (!origin || whitelist.indexOf(helper.trimEnd(origin, '/')) !== -1) {
      callback(null, true);
    } else {
      const message = `Not allowed by CORS: ${origin}`;
      logger.error(message);
      callback(new Error(message));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
/**
 * CORS middleware.
 *
 * @export
 * @returns {*}
 */
export default () => cors(CORS_CONFIG);