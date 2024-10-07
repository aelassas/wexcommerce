import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import path from 'node:path';
import fs from 'node:fs/promises';
import escapeStringRegexp from 'escape-string-regexp';
import axios from 'axios';
import { v1 as uuid } from 'uuid';
import * as wexcommerceTypes from "../../../../packages/wexcommerce-types/index.js";
import * as logger from "../common/logger.js";
import i18n from "../lang/i18n.js";
import * as env from "../config/env.config.js";
import User from "../models/User.js";
import Token from "../models/Token.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Notification from "../models/Notification.js";
import NotificationCounter from "../models/NotificationCounter.js";
import * as helper from "../common/helper.js";
import * as mailHelper from "../common/mailHelper.js";
import * as authHelper from "../common/authHelper.js";
const getStatusMessage = (lang, msg) => {
  if (lang === 'ar') {
    return `<!DOCTYPE html><html dir="rtl" lang="ar"><head></head><body><p>${msg}</p></body></html>`;
  }
  return `<!DOCTYPE html><html lang="${lang}"><head></head><body><p>${msg}</p></body></html>`;
};
/**
 * Sign Up.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @param {wexcommerceTypes.UserType} userType
 * @returns {unknown}
 */
const _signup = async (req, res, userType) => {
  const {
    body
  } = req;
  //
  // Create user
  //
  let user;
  try {
    body.email = helper.trim(body.email, ' ');
    body.active = true;
    body.verified = false;
    body.blacklisted = false;
    body.type = userType;
    const salt = await bcrypt.genSalt(10);
    const {
      password
    } = body;
    const passwordHash = await bcrypt.hash(password, salt);
    body.password = passwordHash;
    user = new User(body);
    await user.save();
    if (body.avatar) {
      const avatar = path.join(env.CDN_TEMP_USERS, body.avatar);
      if (await helper.exists(avatar)) {
        const filename = `${user._id}_${Date.now()}${path.extname(body.avatar)}`;
        const newPath = path.join(env.CDN_USERS, filename);
        await fs.rename(avatar, newPath);
        user.avatar = filename;
        await user.save();
      }
    }
  } catch (err) {
    logger.error(`[user.signup] ${i18n.t('DB_ERROR')} ${JSON.stringify(body)}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
  //
  // Send confirmation email
  //
  try {
    // generate token and save
    const token = new Token({
      user: user._id,
      token: helper.generateToken()
    });
    await token.save();
    // Send email
    i18n.locale = user.language;
    const mailOptions = {
      from: env.SMTP_FROM,
      to: user.email,
      subject: i18n.t('ACCOUNT_ACTIVATION_SUBJECT'),
      html: `<p>
    ${i18n.t('HELLO')}${user.fullName},<br><br>
    ${i18n.t('ACCOUNT_ACTIVATION_LINK')}<br><br>
    http${env.HTTPS ? 's' : ''}://${req.headers.host}/api/confirm-email/${user.email}/${token.token}<br><br>
    ${i18n.t('REGARDS')}<br>
    </p>`
    };
    await mailHelper.sendMail(mailOptions);
    return res.sendStatus(200);
  } catch (err) {
    try {
      //
      // Delete user in case of smtp failure
      //
      await user.deleteOne();
    } catch (deleteErr) {
      logger.error(`[user.signup] ${i18n.t('DB_ERROR')} ${JSON.stringify(body)}`, deleteErr);
    }
    logger.error(`[user.signup] ${i18n.t('SMTP_ERROR')}`, err);
    return res.status(400).send(i18n.t('SMTP_ERROR') + err);
  }
};
/**
 * Frontend Sign Up.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 */
export const signup = async (req, res) => {
  await _signup(req, res, wexcommerceTypes.UserType.User);
};
/**
 * Backend Sign Up.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 */
export const adminSignup = async (req, res) => {
  await _signup(req, res, wexcommerceTypes.UserType.Admin);
};
/**
 * Get Validation result as HTML.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const confirmEmail = async (req, res) => {
  try {
    const {
      token: _token,
      email: _email
    } = req.params;
    if (!helper.isValidEmail(_email)) {
      throw new Error('email is not valid');
    }
    const user = await User.findOne({
      email: _email
    });
    if (!user) {
      logger.error('[user.confirmEmail] User not found', req.params);
      return res.status(204).send(i18n.t('ACCOUNT_ACTIVATION_LINK_ERROR'));
    }
    i18n.locale = user.language;
    const token = await Token.findOne({
      user: user._id,
      token: _token
    });
    // token is not found into database i.e. token may have expired
    if (!token) {
      logger.error(i18n.t('ACCOUNT_ACTIVATION_LINK_EXPIRED'), req.params);
      return res.status(400).send(getStatusMessage(user.language, i18n.t('ACCOUNT_ACTIVATION_LINK_EXPIRED')));
    }
    // if token is found then check valid user
    // not valid user
    if (user.verified) {
      // user is already verified
      return res.status(200).send(getStatusMessage(user.language, i18n.t('ACCOUNT_ACTIVATION_ACCOUNT_VERIFIED')));
    }
    // verify user
    // change verified to true
    user.verified = true;
    user.verifiedAt = new Date();
    await user.save();
    return res.status(200).send(getStatusMessage(user.language, i18n.t('ACCOUNT_ACTIVATION_SUCCESS')));
  } catch (err) {
    logger.error(`[user.confirmEmail] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.params)}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Resend Validation email.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const resendLink = async (req, res) => {
  const {
    body
  } = req;
  const {
    email
  } = body;
  try {
    if (!email || !helper.isValidEmail(email)) {
      throw new Error('email is not valid');
    }
    const user = await User.findOne({
      email
    });
    // user is not found into database
    if (!user) {
      logger.error('[user.resendLink] User not found:', email);
      return res.status(400).send(getStatusMessage(env.DEFAULT_LANGUAGE, i18n.t('ACCOUNT_ACTIVATION_RESEND_ERROR')));
    }
    if (user.verified) {
      // user has been already verified
      return res.status(200).send(getStatusMessage(user.language, i18n.t('ACCOUNT_ACTIVATION_ACCOUNT_VERIFIED')));
    }
    // send verification link
    // generate token and save
    const token = new Token({
      user: user._id,
      token: helper.generateToken()
    });
    await token.save();
    // Send email
    i18n.locale = user.language;
    const mailOptions = {
      from: env.SMTP_FROM,
      to: user.email,
      subject: i18n.t('ACCOUNT_ACTIVATION_SUBJECT'),
      html: `<p>
        ${i18n.t('HELLO')}${user.fullName},<br><br>
        ${i18n.t('ACCOUNT_ACTIVATION_LINK')}<br><br>
        http${env.HTTPS ? 's' : ''}://${req.headers.host}/api/confirm-email/${user.email}/${token.token}<br><br>
        ${i18n.t('REGARDS')}<br>
        </p>`
    };
    await mailHelper.sendMail(mailOptions);
    return res.status(200).send(getStatusMessage(user.language, i18n.t('ACCOUNT_ACTIVATION_EMAIL_SENT_PART_1') + user.email + i18n.t('ACCOUNT_ACTIVATION_EMAIL_SENT_PART_2')));
  } catch (err) {
    logger.error(`[user.resendLink] ${i18n.t('DB_ERROR')} ${email}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Validate email.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const validateEmail = async (req, res) => {
  const {
    body
  } = req;
  const {
    email
  } = body;
  try {
    if (!helper.isValidEmail(email)) {
      throw new Error('body.email is not valid');
    }
    const exists = await User.exists({
      email
    });
    if (exists) {
      return res.sendStatus(204);
    }
    // email does not exist in db (can be added)
    return res.sendStatus(200);
  } catch (err) {
    logger.error(`[user.validateEmail] ${i18n.t('DB_ERROR')} ${email}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Check whether current user is admin.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const isAdmin = async (req, res) => {
  try {
    const {
      body
    } = req;
    const exists = await User.exists({
      email: body.email,
      type: wexcommerceTypes.UserType.Admin
    });
    if (exists) {
      return res.sendStatus(200);
    }
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[user.isAdmin] ${i18n.t('DB_ERROR')} ${req.body.email}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Check whether current user is customer.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const isUser = async (req, res) => {
  try {
    const {
      body
    } = req;
    const exists = await User.exists({
      email: body.email,
      type: wexcommerceTypes.UserType.User
    });
    if (exists) {
      return res.sendStatus(200);
    }
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[user.isUser] ${i18n.t('DB_ERROR')} ${req.body.email}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Resend Validation email.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const resend = async (req, res) => {
  const {
    email
  } = req.params;
  try {
    if (!helper.isValidEmail(email)) {
      throw new Error('email is not valid');
    }
    const user = await User.findOne({
      email
    });
    if (user) {
      const type = req.params.type.toLowerCase();
      if (![wexcommerceTypes.AppType.Frontend, wexcommerceTypes.AppType.Backend].includes(type) || type === wexcommerceTypes.AppType.Backend && user.type === wexcommerceTypes.UserType.User || type === wexcommerceTypes.AppType.Frontend && user.type !== wexcommerceTypes.UserType.User) {
        return res.sendStatus(403);
      }
      user.active = false;
      await user.save();
      // generate token and save
      const token = new Token({
        user: user._id,
        token: helper.generateToken()
      });
      await token.save();
      // Send email
      i18n.locale = user.language;
      const reset = req.params.reset === 'true';
      const mailOptions = {
        from: env.SMTP_FROM,
        to: user.email,
        subject: reset ? i18n.t('PASSWORD_RESET_SUBJECT') : i18n.t('ACCOUNT_ACTIVATION_SUBJECT'),
        html: `<p>
          ${i18n.t('HELLO')}${user.fullName},<br><br>  
          ${reset ? i18n.t('PASSWORD_RESET_LINK') : i18n.t('ACCOUNT_ACTIVATION_LINK')}<br><br>  
          ${helper.joinURL(user.type === wexcommerceTypes.UserType.User ? env.FRONTEND_HOST : env.BACKEND_HOST, reset ? 'reset-password' : 'activate')}/?u=${encodeURIComponent(user.id)}&e=${encodeURIComponent(user.email)}&t=${encodeURIComponent(token.token)}<br><br>
          ${i18n.t('REGARDS')}<br>
          </p>`
      };
      await mailHelper.sendMail(mailOptions);
      return res.sendStatus(200);
    }
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[user.resend] ${i18n.t('DB_ERROR')} ${email}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Activate a User and set his Password.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const activate = async (req, res) => {
  const {
    body
  } = req;
  const {
    userId
  } = body;
  try {
    if (!helper.isValidObjectId(userId)) {
      throw new Error('body.userId is not valid');
    }
    const user = await User.findById(userId);
    if (user) {
      const token = await Token.findOne({
        user: userId,
        token: body.token
      });
      if (token) {
        const salt = await bcrypt.genSalt(10);
        const {
          password
        } = body;
        const passwordHash = await bcrypt.hash(password, salt);
        user.password = passwordHash;
        user.active = true;
        user.verified = true;
        await user.save();
        return res.sendStatus(200);
      }
    }
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[user.activate] ${i18n.t('DB_ERROR')} ${userId}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Check a Validation Token.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const checkToken = async (req, res) => {
  const {
    userId,
    email
  } = req.params;
  try {
    const user = await User.findOne({
      _id: new mongoose.Types.ObjectId(userId),
      email
    });
    if (user) {
      const type = req.params.type.toLowerCase();
      if (![wexcommerceTypes.AppType.Frontend, wexcommerceTypes.AppType.Backend].includes(type) || type === wexcommerceTypes.AppType.Backend && user.type === wexcommerceTypes.UserType.User || type === wexcommerceTypes.AppType.Frontend && user.type !== wexcommerceTypes.UserType.User || user.active) {
        return res.sendStatus(204);
      }
      const token = await Token.findOne({
        user: new mongoose.Types.ObjectId(userId),
        token: req.params.token
      });
      if (token) {
        return res.sendStatus(200);
      }
      return res.sendStatus(204);
    }
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[user.checkToken] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.params)}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Delete Validation Tokens.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteTokens = async (req, res) => {
  const {
    userId
  } = req.params;
  try {
    const result = await Token.deleteMany({
      user: new mongoose.Types.ObjectId(userId)
    });
    if (result.deletedCount > 0) {
      return res.sendStatus(200);
    }
    return res.sendStatus(400);
  } catch (err) {
    logger.error(`[user.deleteTokens] ${i18n.t('DB_ERROR')} ${userId}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Sign In.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const signin = async (req, res) => {
  const {
    body
  } = req;
  const {
    email: emailFromBody,
    password,
    stayConnected
  } = body;
  try {
    if (!emailFromBody) {
      throw new Error('body.email not found');
    }
    const email = helper.trim(emailFromBody, ' ');
    if (!helper.isValidEmail(email)) {
      throw new Error('body.email is not valid');
    }
    const user = await User.findOne({
      email
    });
    const type = req.params.type.toLowerCase();
    if (!password || !user || !user.password || ![wexcommerceTypes.AppType.Frontend, wexcommerceTypes.AppType.Backend].includes(type) || type === wexcommerceTypes.AppType.Backend && user.type === wexcommerceTypes.UserType.User || type === wexcommerceTypes.AppType.Frontend && user.type !== wexcommerceTypes.UserType.User) {
      return res.sendStatus(204);
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      const payload = {
        id: user.id
      };
      const token = await authHelper.encryptJWT(payload, stayConnected);
      //
      // Return the token in the response body.
      //
      const loggedUser = {
        _id: user.id,
        email: user.email,
        fullName: user.fullName,
        language: user.language,
        blacklisted: user.blacklisted,
        avatar: user.avatar,
        accessToken: token
      };
      return res.status(200).send(loggedUser);
    }
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[user.signin] ${i18n.t('DB_ERROR')} ${emailFromBody}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Sign In.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const socialSignin = async (req, res) => {
  const {
    body
  } = req;
  const {
    socialSignInType,
    accessToken,
    email: emailFromBody,
    fullName,
    avatar,
    stayConnected,
    mobile
  } = body;
  try {
    if (!socialSignInType) {
      throw new Error('body.socialSignInType not found');
    }
    if (!emailFromBody) {
      throw new Error('body.email not found');
    }
    const email = helper.trim(emailFromBody, ' ');
    if (!helper.isValidEmail(email)) {
      throw new Error('body.email is not valid');
    }
    if (!mobile) {
      if (!accessToken) {
        throw new Error('body.accessToken not found');
      }
      if (!(await helper.validateAccessToken(socialSignInType, accessToken, email))) {
        throw new Error('body.accessToken is not valid');
      }
    }
    let user = await User.findOne({
      email
    });
    if (!user) {
      user = new User({
        email,
        fullName,
        active: true,
        verified: true,
        language: 'en',
        enableEmailNotifications: true,
        type: wexcommerceTypes.UserType.User,
        blacklisted: false,
        avatar
      });
      await user.save();
    }
    const payload = {
      id: user.id
    };
    const token = await authHelper.encryptJWT(payload, stayConnected);
    //
    // Return the token in the response body.
    //
    const loggedUser = {
      _id: user.id,
      email: user.email,
      fullName: user.fullName,
      language: user.language,
      blacklisted: user.blacklisted,
      avatar: user.avatar,
      accessToken: token
    };
    return res.status(200).send(loggedUser);
  } catch (err) {
    logger.error(`[user.socialSignin] ${i18n.t('DB_ERROR')} ${emailFromBody}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Validate access token.
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {*}
 */
export const validateAccessToken = (req, res) => res.sendStatus(200);
/**
 * Get User by ID.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getUser = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    if (!helper.isValidObjectId(id)) {
      throw new Error('User id is not valid');
    }
    const user = await User.findById(id, {
      email: 1,
      fullName: 1,
      phone: 1,
      address: 1,
      verified: 1,
      language: 1,
      type: 1,
      customerId: 1
    }).lean();
    if (!user) {
      logger.error('[user.getUser] User not found:', req.params);
      return res.sendStatus(204);
    }
    return res.json(user);
  } catch (err) {
    logger.error(`[user.getUser] ${i18n.t('DB_ERROR')} ${id}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Update User.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const update = async (req, res) => {
  try {
    const {
      body
    } = req;
    const {
      _id
    } = body;
    if (!helper.isValidObjectId(_id)) {
      throw new Error('User id is not valid');
    }
    const user = await User.findById(_id);
    if (!user) {
      logger.error('[user.update] User not found:', body.email);
      return res.sendStatus(204);
    }
    const {
      fullName,
      phone,
      address
    } = req.body;
    if (fullName) {
      user.fullName = fullName;
    }
    user.phone = phone;
    user.address = address;
    await user.save();
    return res.sendStatus(200);
  } catch (err) {
    logger.error(`[user.update] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Update language.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const updateLanguage = async (req, res) => {
  try {
    const {
      body
    } = req;
    const {
      id,
      language
    } = body;
    if (!helper.isValidObjectId(id)) {
      throw new Error('User id is not valid');
    }
    const user = await User.findById(id);
    if (!user) {
      logger.error('[user.updateLanguage] User not found:', id);
      return res.sendStatus(204);
    }
    user.language = language;
    await user.save();
    return res.sendStatus(200);
  } catch (err) {
    logger.error(`[user.updateLanguage] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Check password.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const checkPassword = async (req, res) => {
  const {
    id,
    password
  } = req.params;
  try {
    if (!helper.isValidObjectId(id)) {
      throw new Error('User id is not valid');
    }
    const user = await User.findById(id);
    if (user) {
      if (!user.password) {
        logger.error('[user.changePassword] User.password not found');
        return res.sendStatus(204);
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        return res.sendStatus(200);
      }
      return res.sendStatus(204);
    }
    logger.error('[user.checkPassword] User not found:', id);
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[user.checkPassword] ${i18n.t('DB_ERROR')} ${id}`, err);
    return res.status(400).send(i18n.t('ERROR') + err);
  }
};
/**
 * Change password.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const changePassword = async (req, res) => {
  const {
    body
  } = req;
  const {
    _id,
    password: currentPassword,
    newPassword,
    strict
  } = body;
  try {
    if (!helper.isValidObjectId(_id)) {
      throw new Error('User id is not valid');
    }
    const user = await User.findOne({
      _id
    });
    if (!user) {
      logger.error('[user.changePassword] User not found:', _id);
      return res.sendStatus(204);
    }
    if (strict && !user.password) {
      logger.error('[user.changePassword] User.password not found:', _id);
      return res.sendStatus(204);
    }
    const _changePassword = async () => {
      const salt = await bcrypt.genSalt(10);
      const password = newPassword;
      const passwordHash = await bcrypt.hash(password, salt);
      user.password = passwordHash;
      await user.save();
      return res.sendStatus(200);
    };
    if (strict) {
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (passwordMatch) {
        return _changePassword();
      }
      return res.sendStatus(204);
    }
    return _changePassword();
  } catch (err) {
    logger.error(`[user.changePassword] ${i18n.t('DB_ERROR')} ${_id}`, err);
    return res.status(400).send(i18n.t('ERROR') + err);
  }
};
/**
 * Get Users.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getUsers = async (req, res) => {
  try {
    let keyword = String(req.query.s || '');
    const options = 'i';
    const page = Number.parseInt(req.params.page, 10);
    const size = Number.parseInt(req.params.size, 10);
    let $match;
    if (keyword) {
      const isObjectId = mongoose.isValidObjectId(keyword);
      if (isObjectId) {
        $match = {
          $and: [{
            type: wexcommerceTypes.UserType.User
          }, {
            _id: {
              $eq: new mongoose.Types.ObjectId(keyword)
            }
          }]
        };
      } else {
        keyword = escapeStringRegexp(keyword);
        $match = {
          $and: [{
            type: wexcommerceTypes.UserType.User
          }, {
            $or: [{
              fullName: {
                $regex: keyword,
                $options: options
              }
            }, {
              email: {
                $regex: keyword,
                $options: options
              }
            }]
          }]
        };
      }
    } else {
      $match = {
        type: wexcommerceTypes.UserType.User
      };
    }
    const users = await User.aggregate([{
      $match
    }, {
      $project: {
        email: 1,
        fullName: 1,
        phone: 1,
        address: 1,
        verified: 1,
        language: 1,
        type: 1,
        createdAt: 1
      }
    }, {
      $facet: {
        resultData: [{
          $sort: {
            fullName: 1
          }
        }, {
          $skip: (page - 1) * size
        }, {
          $limit: size
        }],
        pageInfo: [{
          $count: 'totalRecords'
        }]
      }
    }], {
      collation: {
        locale: env.DEFAULT_LANGUAGE,
        strength: 2
      }
    });
    return res.json(users);
  } catch (err) {
    logger.error(i18n.t('DB_ERROR'), err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Delete Users.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteUsers = async (req, res) => {
  try {
    const {
      body
    } = req;
    const ids = body.map(id => new mongoose.Types.ObjectId(id));
    for (const id of ids) {
      const user = await User.findById(id);
      if (user) {
        await User.deleteOne({
          _id: id
        });
        if (user.avatar) {
          const avatar = path.join(env.CDN_USERS, user.avatar);
          if (await helper.exists(avatar)) {
            await fs.unlink(avatar);
          }
        }
        if (user.type === wexcommerceTypes.UserType.User) {
          const orders = await Order.find({
            user: id
          });
          for (const order of orders) {
            await OrderItem.deleteMany({
              _id: {
                $in: order.orderItems
              }
            });
            await order.deleteOne();
          }
        }
        await NotificationCounter.deleteMany({
          user: id
        });
        await Notification.deleteMany({
          user: id
        });
      } else {
        logger.error('User not found:', id);
      }
    }
    return res.sendStatus(200);
  } catch (err) {
    logger.error(`[user.delete] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Validate Google reCAPTCHA v3 token.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const verifyRecaptcha = async (req, res) => {
  try {
    const {
      token,
      ip
    } = req.params;
    const result = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(env.RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}&remoteip=${ip}`);
    const {
      success
    } = result.data;
    if (success) {
      return res.sendStatus(200);
    }
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[user.delete] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Send an email. reCAPTCHA is mandatory.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const sendEmail = async (req, res) => {
  try {
    const {
      body
    } = req;
    const {
      from,
      to,
      subject,
      message,
      recaptchaToken: token,
      ip
    } = body;
    const result = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(env.RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}&remoteip=${ip}`);
    const {
      success
    } = result.data;
    if (!success) {
      return res.sendStatus(400);
    }
    const mailOptions = {
      from: env.SMTP_FROM,
      to,
      subject: i18n.t('CONTACT_SUBJECT'),
      html: `<p>
              ${i18n.t('FROM')}: ${from}<br>
              ${i18n.t('SUBJECT')}: ${subject}<br>
              ${i18n.t('MESSAGE')}:<br>${message.replace(/(?:\r\n|\r|\n)/g, '<br>')}<br>
         </p>`
    };
    await mailHelper.sendMail(mailOptions);
    return res.sendStatus(200);
  } catch (err) {
    logger.error(`[user.delete] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Check if password exists.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const hasPassword = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const passwordExists = await User.exists({
      _id: id,
      password: {
        $ne: null
      }
    });
    if (passwordExists) {
      return res.sendStatus(200);
    }
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[user.hasPassword] ${i18n.t('DB_ERROR')} ${id}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Upload avatar to temp folder.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const createAvatar = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('[user.createAvatar] req.file not found');
    }
    const filename = `${helper.getFilenameWithoutExtension(req.file.originalname)}_${uuid()}_${Date.now()}${path.extname(req.file.originalname)}`;
    const filepath = path.join(env.CDN_TEMP_USERS, filename);
    await fs.writeFile(filepath, req.file.buffer);
    return res.json(filename);
  } catch (err) {
    logger.error(`[user.createAvatar] ${i18n.t('DB_ERROR')}`, err);
    return res.status(400).send(i18n.t('ERROR') + err);
  }
};
/**
 * Update avatar.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const updateAvatar = async (req, res) => {
  const {
    userId
  } = req.params;
  try {
    if (!req.file) {
      const msg = 'req.file not found';
      logger.error(`[user.createAvatar] ${msg}`);
      return res.status(400).send(msg);
    }
    const user = await User.findById(userId);
    if (user) {
      if (user.avatar && !user.avatar.startsWith('http')) {
        const avatar = path.join(env.CDN_USERS, user.avatar);
        if (await helper.exists(avatar)) {
          await fs.unlink(avatar);
        }
      }
      const filename = `${user._id}_${Date.now()}${path.extname(req.file.originalname)}`;
      const filepath = path.join(env.CDN_USERS, filename);
      await fs.writeFile(filepath, req.file.buffer);
      user.avatar = filename;
      await user.save();
      return res.json(filename);
    }
    logger.error('[user.updateAvatar] User not found:', userId);
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[user.updateAvatar] ${i18n.t('DB_ERROR')} ${userId}`, err);
    return res.status(400).send(i18n.t('ERROR') + err);
  }
};
/**
 * Delete avatar.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteAvatar = async (req, res) => {
  const {
    userId
  } = req.params;
  try {
    const user = await User.findById(userId);
    if (user) {
      if (user.avatar && !user.avatar.startsWith('http')) {
        const avatar = path.join(env.CDN_USERS, user.avatar);
        if (await helper.exists(avatar)) {
          await fs.unlink(avatar);
        }
      }
      user.avatar = undefined;
      await user.save();
      return res.sendStatus(200);
    }
    logger.error('[user.deleteAvatar] User not found:', userId);
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[user.deleteAvatar] ${i18n.t('DB_ERROR')} ${userId}`, err);
    return res.status(400).send(i18n.t('ERROR') + err);
  }
};
/**
 * Delete temp avatar.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteTempAvatar = async (req, res) => {
  const {
    avatar
  } = req.params;
  try {
    const avatarFile = path.join(env.CDN_TEMP_USERS, avatar);
    if (!(await helper.exists(avatarFile))) {
      throw new Error(`[user.deleteTempAvatar] temp avatar ${avatarFile} not found`);
    }
    await fs.unlink(avatarFile);
    return res.sendStatus(200);
  } catch (err) {
    logger.error(`[user.deleteTempAvatar] ${i18n.t('DB_ERROR')} ${avatar}`, err);
    return res.status(400).send(i18n.t('ERROR') + err);
  }
};