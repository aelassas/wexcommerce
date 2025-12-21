import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as env from '../config/env.config'
import * as helper from '../utils/helper'
import * as authHelper from '../utils/authHelper'
import * as logger from '../utils/logger'
import User from '../models/User'

/**
 * Verify authentication token middleware.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const isAdmin = authHelper.isAdmin(req)
  const isFrontend = authHelper.isFrontend(req)
  const token = req.headers[env.X_ACCESS_TOKEN] as string

  if (token) {
    // Check token
    try {
      const sessionData = await authHelper.decryptJWT(token)
      const $match: mongoose.QueryFilter<env.User> = {
        $and: [
          { _id: sessionData?.id },
          { blacklisted: { $in: [null, false] } },
        ],
      }

      if (isAdmin) {
        $match.$and?.push({ type: wexcommerceTypes.UserType.Admin })
      } else if (isFrontend) {
        $match.$and?.push({ type: wexcommerceTypes.UserType.User })
      }

      if (
        !sessionData
        || !helper.isValidObjectId(sessionData.id)
        || !(await User.exists($match))
      ) {
        // Token not valid!
        logger.info('Token not valid: User not found')
        res.status(401).send({ message: 'Unauthorized!' })
      } else {
        // Token valid!
        next()
      }
    } catch (err) {
      // Token not valid!
      logger.info('Token not valid', err)
      res.status(401).send({ message: 'Unauthorized!' })
    }
  } else {
    // Token not found!
    res.status(403).send({ message: 'No token provided!' })
  }
}

export default { verifyToken }
