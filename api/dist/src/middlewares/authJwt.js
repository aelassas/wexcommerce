import * as wexcommerceTypes from "../../../../packages/wexcommerce-types/index.js";
import * as env from "../config/env.config.js";
import * as helper from "../common/helper.js";
import * as authHelper from "../common/authHelper.js";
import * as logger from "../common/logger.js";
import User from "../models/User.js";
/**
 * Verify authentication token middleware.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
const verifyToken = async (req, res, next) => {
  const isBackend = authHelper.isBackend(req);
  const isFrontend = authHelper.isFrontend(req);
  let token = req.headers[env.X_ACCESS_TOKEN];
  if (token) {
    // Check token
    try {
      const sessionData = await authHelper.decryptJWT(token);
      const $match = {
        $and: [{
          _id: sessionData?.id
        }, {
          blacklisted: false
        }]
      };
      if (isBackend) {
        $match.$and?.push({
          type: wexcommerceTypes.UserType.Admin
        });
      } else if (isFrontend) {
        $match.$and?.push({
          type: wexcommerceTypes.UserType.User
        });
      }
      if (!sessionData || !helper.isValidObjectId(sessionData.id) || !(await User.exists($match))) {
        // Token not valid!
        logger.info('Token not valid: User not found');
        res.status(401).send({
          message: 'Unauthorized!'
        });
      } else {
        // Token valid!
        next();
      }
    } catch (err) {
      // Token not valid!
      logger.info('Token not valid', err);
      res.status(401).send({
        message: 'Unauthorized!'
      });
    }
  } else {
    // Token not found!
    res.status(403).send({
      message: 'No token provided!'
    });
  }
};
export default {
  verifyToken
};