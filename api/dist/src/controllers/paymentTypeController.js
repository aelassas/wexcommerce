import * as wexcommerceTypes from "../../../../packages/wexcommerce-types/index.js";
import * as logger from "../common/logger.js";
import i18n from "../lang/i18n.js";
import PaymentType from "../models/PaymentType.js";
export const init = async () => {
  try {
    const _init = async (paymentType, enabled) => {
      const pt = await PaymentType.findOne({
        name: paymentType
      });
      if (!pt) {
        await new PaymentType({
          name: paymentType,
          enabled
        }).save();
        logger.info(`Payment Type ${paymentType} created.`);
      }
    };
    await _init(wexcommerceTypes.PaymentType.CreditCard, true);
    await _init(wexcommerceTypes.PaymentType.Cod, true);
    await _init(wexcommerceTypes.PaymentType.WireTransfer, false);
    return true;
  } catch (err) {
    logger.error(`[paymentType.init] ${i18n.t('DB_ERROR')}`, err);
    return false;
  }
};
export const getPaymentTypes = async (req, res) => {
  try {
    const paymentTypes = await PaymentType.find().sort({
      createdAt: 1
    });
    return res.json(paymentTypes);
  } catch (err) {
    logger.error(`[paymentType.getPaymentTypes] ${i18n.t('DB_ERROR')}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
export const getEnabledPaymentTypes = async (req, res) => {
  try {
    const paymentTypes = await PaymentType.find({
      enabled: true
    }).sort({
      createdAt: 1
    });
    return res.json(paymentTypes);
  } catch (err) {
    logger.error(`[paymentType.getEnabledPaymentTypes] ${i18n.t('DB_ERROR')}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
export const updatePaymentTypes = async (req, res) => {
  try {
    const paymentTypes = req.body;
    for (const paymentType of paymentTypes) {
      const pt = await PaymentType.findOne({
        name: paymentType.name
      });
      if (pt) {
        pt.enabled = paymentType.enabled;
        await pt.save();
      }
    }
    return res.sendStatus(200);
  } catch (err) {
    logger.error(`[paymentType.updatePaymentTypes] ${i18n.t('DB_ERROR')} ${req.body}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};