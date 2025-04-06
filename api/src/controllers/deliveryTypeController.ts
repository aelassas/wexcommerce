import { Request, Response } from 'express'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as logger from '../common/logger'
import i18n from '../lang/i18n'
import DeliveryType from '../models/DeliveryType'

export const init = async () => {
  try {
    const _init = async (deliveryType: wexcommerceTypes.DeliveryType, enabled: boolean) => {
      const dt = await DeliveryType.findOne({ name: deliveryType })

      if (!dt) {
        await new DeliveryType({ name: deliveryType, enabled }).save()
        logger.info(`Delivery Type ${deliveryType} created.`)
      }
    }

    await _init(wexcommerceTypes.DeliveryType.Shipping, true)
    await _init(wexcommerceTypes.DeliveryType.Withdrawal, true)

    return true
  } catch (err) {
    logger.error(`[deliveryType.init] ${i18n.t('DB_ERROR')}`, err)
    return false
  }
}

export const getDeliveryTypes = async (req: Request, res: Response) => {
  try {
    const deliveryTypes = await DeliveryType.find().sort({ createdAt: 1 })

    res.json(deliveryTypes)
  } catch (err) {
    logger.error(`[deliveryType.getDeliveryTypes] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const getEnabledDeliveryTypes = async (req: Request, res: Response) => {
  try {
    const deliveryTypes = await DeliveryType.find({ enabled: true }).sort({ createdAt: 1 })

    res.json(deliveryTypes)
  } catch (err) {
    logger.error(`[deliveryType.getEnabledDeliveryTypes] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const updateDeliveryTypes = async (req: Request, res: Response) => {
  try {
    const deliveryTypes: wexcommerceTypes.UpdateDeliveryTypesPayload = req.body

    for (const deliveryType of deliveryTypes) {
      const dt = await DeliveryType.findOne({ name: deliveryType.name })
      if (dt) {
        dt.enabled = deliveryType.enabled
        dt.price = Number(deliveryType.price)
        await dt.save()
      }
    }

    res.sendStatus(200)
  } catch (err) {
    logger.error(`[deliveryType.updateDeliveryTypes] ${i18n.t('DB_ERROR')} ${req.body}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
