import type { Request, Response, NextFunction } from 'express'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as env from '../config/env.config'
import * as helper from '../utils/helper'
import * as authHelper from '../utils/authHelper'
import * as logger from '../utils/logger'
import User from '../models/User'

// Extend Express Request interface to include user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: { _id: string, type: wexcommerceTypes.UserType }
  }
}

/**
 * Verify authentication token middleware.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Get token from cookies or headers
  const token = req.headers[env.X_ACCESS_TOKEN] as string

  if (!token) {
    res.status(403).send({ message: 'No token provided!' })
    return
  }

  try {
    // 2. Decrypt and verify the token
    const sessionData = await authHelper.decryptJWT(token)

    if (!sessionData || !helper.isValidObjectId(sessionData.id)) {
      res.status(401).send({ message: 'Unauthorized!' })
      return
    }

    // 3. Fetch the user and attach to the request object
    const user = await User.findById(sessionData.id)

    if (!user || user.blacklisted) {
      res.status(401).send({ message: 'Unauthorized!' })
      return
    }

    // 4. Attach user to request for use in the next middleware/controller
    req.user = { _id: user._id.toString(), type: user.type as wexcommerceTypes.UserType }
    next()
  } catch (err) {
    logger.info('Token verification failed', err)
    res.status(401).send({ message: 'Unauthorized!' })
  }
}

/**
 * Auth for Admin only.
 *
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
const authAdmin = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req
  if (user && user.type === wexcommerceTypes.UserType.Admin) {
    next()
  } else {
    res.status(403).send({ message: 'Require Admin Role!' })
  }
}

export default { verifyToken, authAdmin }
