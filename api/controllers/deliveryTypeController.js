import strings from '../config/app.config.js'
import Env from '../config/env.config.js'
import DeliveryType from '../models/DeliveryType.js'

export const init = async () => {
    try {
        const _init = async (deliveryType, enabled) => {
            const dt = await DeliveryType.findOne({ name: deliveryType })

            if (!dt) {
                await new DeliveryType({ name: deliveryType, enabled }).save()
                console.log(`Delivery Type ${deliveryType} created.`)
            }
        }

        await _init(Env.DELIVERY_TYPE.SHIPPING, true)
        await _init(Env.DELIVERY_TYPE.WITHDRAWAL, true)

        return true
    } catch (err) {
        console.error(`[deliveryType.init]  ${strings.DB_ERROR}`, err)
        return false
    }
}

export const getDeliveryTypes = async (req, res) => {
    try {
        const deliveryTypes = await DeliveryType.find().sort({ createdAt: 1 })

        return res.json(deliveryTypes)
    } catch (err) {
        console.error(`[deliveryType.getDeliveryTypes]  ${strings.DB_ERROR}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const getEnabledDeliveryTypes = async (req, res) => {
    try {
        const deliveryTypes = await DeliveryType.find({ enabled: true }).sort({ createdAt: 1 })

        return res.json(deliveryTypes)
    } catch (err) {
        console.error(`[deliveryType.getEnabledDeliveryTypes]  ${strings.DB_ERROR}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const updateDeliveryTypes = async (req, res) => {
    try {
        const deliveryTypes = req.body

        for (const deliveryType of deliveryTypes) {
            const dt = await DeliveryType.findOne({ name: deliveryType.name })
            dt.enabled = deliveryType.enabled
            dt.price = deliveryType.price
            await dt.save()
        }

        return res.sendStatus(200)
    } catch (err) {
        console.error(`[deliveryType.updateDeliveryTypes]  ${strings.DB_ERROR} ${req.body}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}