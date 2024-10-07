import * as logger from "../common/logger.js";
import i18n from "../lang/i18n.js";
import * as env from "../config/env.config.js";
import Setting from "../models/Setting.js";
/**
 * Initialize settings.
 *
 * @async
 * @returns {unknown}
 */
export const init = async () => {
  try {
    const exists = await Setting.exists({});
    if (exists) {
      await new Setting().save();
    }
    return true;
  } catch (err) {
    logger.error(`[setting.init] ${i18n.t('DB_ERROR')}`, err);
    return false;
  }
};
/**
 * Get language.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getLanguage = async (req, res) => {
  try {
    const settings = await Setting.findOne();
    return res.json(settings?.language || env.DEFAULT_LANGUAGE);
  } catch (err) {
    logger.error(`[setting.getLanguage] ${i18n.t('DB_ERROR')}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Get currency.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getCurrency = async (req, res) => {
  try {
    const settings = await Setting.findOne();
    return res.json(settings?.currency || env.DEFAULT_CURRENCY);
  } catch (err) {
    logger.error(`[setting.getCurrency] ${i18n.t('DB_ERROR')}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Get settings.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne();
    return res.json(settings);
  } catch (err) {
    logger.error(`[setting.getSettings] ${i18n.t('DB_ERROR')}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Update settings.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const updateSettings = async (req, res) => {
  try {
    const {
      language,
      currency
    } = req.body;
    const settings = await Setting.findOne();
    if (settings) {
      settings.language = language;
      settings.currency = currency;
      await settings.save();
      return res.sendStatus(200);
    }
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[setting.updateSettings] ${i18n.t('DB_ERROR')}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Update bank settings.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const updateBankSettings = async (req, res) => {
  try {
    const {
      bankName,
      accountHolder,
      rib,
      iban
    } = req.body;
    const settings = await Setting.findOne();
    if (settings) {
      settings.bankName = bankName;
      settings.accountHolder = accountHolder;
      settings.rib = rib;
      settings.iban = iban;
      await settings.save();
      return res.sendStatus(200);
    }
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[setting.updateBankSettings] ${i18n.t('DB_ERROR')}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};