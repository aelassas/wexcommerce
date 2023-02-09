import strings from '../config/app.config.js'
import Setting from '../models/Setting.js'

export const init = async () => {
    try {
        const count = await Setting.findOne().count()

        if (count === 0) {
            await new Setting().save()
        }

        return true
    } catch (err) {
        console.error(`[setting.init]  ${strings.DB_ERROR}`, err)
        return false
    }
}

export const getLanguage = async (req, res) => {
    try {
        const settings = await Setting.findOne()

        return res.json(settings.language)
    } catch (err) {
        console.error(`[setting.getLanguage]  ${strings.DB_ERROR}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const getCurrency = async (req, res) => {
    try {
        const settings = await Setting.findOne()

        return res.json(settings.currency)
    } catch (err) {
        console.error(`[setting.getCurrency]  ${strings.DB_ERROR}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const getSettings = async (req, res) => {
    try {
        const settings = await Setting.findOne()

        return res.json(settings)
    } catch (err) {
        console.error(`[setting.getSettings]  ${strings.DB_ERROR}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const updateSettings = async (req, res) => {
    try {
        const { language, currency } = req.body
        const settings = await Setting.findOne()

        settings.language = language
        settings.currency = currency

        await settings.save()

        return res.sendStatus(200)
    } catch (err) {
        console.error(`[setting.updateSettings]  ${strings.DB_ERROR}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const updateBankSettings = async (req, res) => {
    try {
        const { bankName, accountHolder, rib, iban } = req.body
        const settings = await Setting.findOne()

        settings.bankName = bankName
        settings.accountHolder = accountHolder
        settings.rib = rib
        settings.iban = iban

        await settings.save()

        return res.sendStatus(200)
    } catch (err) {
        console.error(`[setting.updateBankSettings]  ${strings.DB_ERROR}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}