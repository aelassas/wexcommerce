import strings from '../config/app.config.js'
import Notification from '../models/Notification.js'
import NotificationCounter from '../models/NotificationCounter.js'
import User from '../models/User.js'
import nodemailer from "nodemailer"
import mongoose from 'mongoose'

const HTTPS = process.env.WC_HTTPS.toLowerCase() === 'true'
const APP_HOST = process.env.WC_FRONTEND_HOST
const SMTP_HOST = process.env.WC_SMTP_HOST
const SMTP_PORT = process.env.WC_SMTP_PORT
const SMTP_USER = process.env.WC_SMTP_USER
const SMTP_PASS = process.env.WC_SMTP_PASS
const SMTP_FROM = process.env.WC_SMTP_FROM

export const notificationCounter = (req, res) => {
    NotificationCounter.findOne({ user: req.params.userId })
        .then(counter => {
            if (counter) {
                res.json(counter)
            } else {
                const cnt = new NotificationCounter({ user: req.params.userId })
                cnt.save()
                    .then(n => {
                        res.json(cnt)
                    })
                    .catch((err) => {
                        console.error(strings.DB_ERROR, err)
                        res.status(400).send(strings.DB_ERROR + err)
                    })
            }
        })
        .catch((err) => {
            console.error(strings.DB_ERROR, err)
            res.status(400).send(strings.DB_ERROR + err)
        })
}

export const getNotifications = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.userId)
        const page = parseInt(req.params.page)
        const size = parseInt(req.params.size)

        const notifications = await Notification.aggregate([
            { $match: { user: userId } },
            {
                $facet: {
                    resultData: [
                        { $sort: { createdAt: -1 } },
                        { $skip: ((page - 1) * size) },
                        { $limit: size },
                    ],
                    pageInfo: [
                        {
                            $count: 'totalRecords'
                        }
                    ]
                }
            }
        ])

        res.json(notifications)
    } catch (err) {
        console.error(strings.DB_ERROR, err)
        res.status(400).send(strings.DB_ERROR + err)
    }
}

export const markAsRead = async (req, res) => {

    try {
        const { ids: _ids } = req.body, ids = _ids.map(id => new mongoose.Types.ObjectId(id))
        const { userId: _userId } = req.params, userId = new mongoose.Types.ObjectId(_userId)

        const bulk = Notification.collection.initializeOrderedBulkOp()
        const notifications = await Notification.find({ _id: { $in: ids }, isRead: false })
        const length = notifications.length

        bulk.find({ _id: { $in: ids }, isRead: false }).update({ $set: { isRead: true } })
        const result = await bulk.execute()

        if (result.modifiedCount !== length) {
            console.error(`[notification.markAsRead] ${strings.DB_ERROR}`)
            return res.status(400).send(strings.DB_ERROR)
        }
        const counter = await NotificationCounter.findOne({ user: userId })
        counter.count -= length
        await counter.save()

        return res.sendStatus(200)

    } catch (err) {
        console.error(`[notification.markAsRead] ${strings.DB_ERROR}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const markAsUnRead = async (req, res) => {

    try {
        const { ids: _ids } = req.body, ids = _ids.map(id => new mongoose.Types.ObjectId(id))
        const { userId: _userId } = req.params, userId = new mongoose.Types.ObjectId(_userId)

        const bulk = Notification.collection.initializeOrderedBulkOp()
        const notifications = await Notification.find({ _id: { $in: ids }, isRead: true })
        const length = notifications.length

        bulk.find({ _id: { $in: ids }, isRead: true }).update({ $set: { isRead: false } })
        const result = await bulk.execute()

        if (result.modifiedCount !== length) {
            console.error(`[notification.markAsUnRead] ${strings.DB_ERROR}`)
            return res.status(400).send(strings.DB_ERROR)
        }
        const counter = await NotificationCounter.findOne({ user: userId })
        counter.count += length
        await counter.save()

        return res.sendStatus(200)

    } catch (err) {
        console.error(`[notification.markAsUnRead] ${strings.DB_ERROR}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const { ids: _ids } = req.body, ids = _ids.map(id => new mongoose.Types.ObjectId(id))
        const { userId: _userId } = req.params, userId = new mongoose.Types.ObjectId(_userId)

        const count = await Notification.find({ _id: { $in: ids }, isRead: false }).count()
        await Notification.deleteMany({ _id: { $in: ids } })

        const counter = await NotificationCounter.findOne({ user: userId })
        counter.count -= count
        await counter.save()

        return res.sendStatus(200)

    } catch (err) {
        console.error(`[notification.delete] ${strings.DB_ERROR}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}