import * as wexcommerceTypes from "../../../../packages/wexcommerce-types/index.js";
import * as logger from "../common/logger.js";
import i18n from "../lang/i18n.js";
import DeliveryType from "../models/DeliveryType.js";
export const init = async () => {
  try {
    const _init = async (deliveryType, enabled) => {
      const dt = await DeliveryType.findOne({
        name: deliveryType
      });
      if (!dt) {
        await new DeliveryType({
          name: deliveryType,
          enabled
        }).save();
        logger.info(`Delivery Type ${deliveryType} created.`);
      }
    };
    await _init(wexcommerceTypes.DeliveryType.Shipping, true);
    await _init(wexcommerceTypes.DeliveryType.Withdrawal, true);
    return true;
  } catch (err) {
    logger.error(`[deliveryType.init] ${i18n.t('DB_ERROR')}`, err);
    return false;
  }
};
export const getDeliveryTypes = async (req, res) => {
  try {
    const deliveryTypes = await DeliveryType.find().sort({
      createdAt: 1
    });
    return res.json(deliveryTypes);
  } catch (err) {
    logger.error(`[deliveryType.getDeliveryTypes] ${i18n.t('DB_ERROR')}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
export const getEnabledDeliveryTypes = async (req, res) => {
  try {
    const deliveryTypes = await DeliveryType.find({
      enabled: true
    }).sort({
      createdAt: 1
    });
    return res.json(deliveryTypes);
  } catch (err) {
    logger.error(`[deliveryType.getEnabledDeliveryTypes] ${i18n.t('DB_ERROR')}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
export const updateDeliveryTypes = async (req, res) => {
  try {
    const deliveryTypes = req.body;
    for (const deliveryType of deliveryTypes) {
      const dt = await DeliveryType.findOne({
        name: deliveryType.name
      });
      if (dt) {
        dt.enabled = deliveryType.enabled;
        dt.price = deliveryType.price;
        await dt.save();
      }
    }
    return res.sendStatus(200);
  } catch (err) {
    logger.error(`[deliveryType.updateDeliveryTypes] ${i18n.t('DB_ERROR')} ${req.body}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};