import { Request, Response } from 'express'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as logger from '../common/logger'
import i18n from '../lang/i18n'
import PaymentType from '../models/PaymentType'

export const init = async () => {
  try {
    const _init = async (paymentType: wexcommerceTypes.PaymentType, enabled: boolean) => {
      const pt = await PaymentType.findOne({ name: paymentType })

      if (!pt) {
        await new PaymentType({ name: paymentType, enabled }).save()
        logger.info(`Payment Type ${paymentType} created.`)
      }
    }

    await _init(wexcommerceTypes.PaymentType.CreditCard, true)
    await _init(wexcommerceTypes.PaymentType.Cod, true)
    await _init(wexcommerceTypes.PaymentType.WireTransfer, false)

    return true
  } catch (err) {
    logger.error(`[paymentType.init] ${i18n.t('DB_ERROR')}`, err)
    return false
  }
}

export const getPaymentTypes = async (req: Request, res: Response) => {
  try {
    const paymentTypes = await PaymentType.find({}).sort({ createdAt: 1 })

    res.json(paymentTypes)
  } catch (err) {
    logger.error(`[paymentType.getPaymentTypes] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const getEnabledPaymentTypes = async (req: Request, res: Response) => {
  try {
    const paymentTypes = await PaymentType.find({ enabled: true }).sort({ createdAt: 1 })

    res.json(paymentTypes)
  } catch (err) {
    logger.error(`[paymentType.getEnabledPaymentTypes] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const updatePaymentTypes = async (req: Request, res: Response) => {
  try {
    const paymentTypes: wexcommerceTypes.UpdatePaymentTypesPayload = req.body

    for (const paymentType of paymentTypes) {
      const pt = await PaymentType.findOne({ name: paymentType.name })
      if (pt) {
        pt.enabled = paymentType.enabled
        await pt.save()
      }
    }

    res.sendStatus(200)
  } catch (err) {
    logger.error(`[paymentType.updatePaymentTypes] ${i18n.t('DB_ERROR')} ${req.body}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
