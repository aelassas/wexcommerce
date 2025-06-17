import { Request, Response } from 'express'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as logger from '../common/logger'
import i18n from '../lang/i18n'
import * as env from '../config/env.config'
import Setting from '../models/Setting'

/**
 * Initialize settings.
 *
 * @async
 * @returns {Promise<boolean>}
 */
export const init = async () => {
  try {
    const count = await Setting.findOne({}).countDocuments()

    if (count === 0) {
      await new Setting().save()
    }

    return true
  } catch (err) {
    logger.error(`[setting.init] ${i18n.t('DB_ERROR')}`, err)
    return false
  }
}

/**
 * Get language.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getLanguage = async (req: Request, res: Response) => {
  try {
    const settings = await Setting.findOne({})

    res.json(settings?.language || env.DEFAULT_LANGUAGE)
  } catch (err) {
    logger.error(`[setting.getLanguage] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get currency.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getCurrency = async (req: Request, res: Response) => {
  try {
    const settings = await Setting.findOne({})

    res.json(settings?.currency || env.DEFAULT_CURRENCY)
  } catch (err) {
    logger.error(`[setting.getCurrency] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get currency.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getStripeCurrency = async (req: Request, res: Response) => {
  try {
    const settings = await Setting.findOne({})

    res.json(settings?.stripeCurrency || env.DEFAULT_STRIPE_CURRENCY)
  } catch (err) {
    logger.error(`[setting.getCurrency] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get settings.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await Setting.findOne({})

    res.json(settings)
  } catch (err) {
    logger.error(`[setting.getSettings] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Update settings.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { language, currency, stripeCurrency }: wexcommerceTypes.UpdateSettingsPayload = req.body
    const settings = await Setting.findOne({})

    if (settings) {
      settings.language = language
      settings.currency = currency
      settings.stripeCurrency = stripeCurrency

      await settings.save()

      res.sendStatus(200)
      return
    }

    res.sendStatus(204)
  } catch (err) {
    logger.error(`[setting.updateSettings] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Update bank settings.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const updateBankSettings = async (req: Request, res: Response) => {
  try {
    const { bankName, accountHolder, rib, iban }: wexcommerceTypes.UpdateBankSettingsPayload = req.body
    const settings = await Setting.findOne({})

    if (settings) {
      settings.bankName = bankName
      settings.accountHolder = accountHolder
      settings.rib = rib
      settings.iban = iban

      await settings.save()

      res.sendStatus(200)
      return
    }

    res.sendStatus(204)
  } catch (err) {
    logger.error(`[setting.updateBankSettings] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
