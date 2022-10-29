import strings from '../config/app.config.js';
import Notification from '../models/Notification.js';
import NotificationCounter from '../models/NotificationCounter.js';
import User from '../models/User.js';
import nodemailer from "nodemailer";
import mongoose from 'mongoose';

const HTTPS = process.env.SC_HTTPS.toLowerCase() === 'true';
const APP_HOST = process.env.SC_FRONTEND_HOST;
const SMTP_HOST = process.env.SC_SMTP_HOST;
const SMTP_PORT = process.env.SC_SMTP_PORT;
const SMTP_USER = process.env.SC_SMTP_USER;
const SMTP_PASS = process.env.SC_SMTP_PASS;
const SMTP_FROM = process.env.SC_SMTP_FROM;

export const notificationCounter = (req, res) => {
    NotificationCounter.findOne({ user: req.params.userId })
        .then(counter => {
            if (counter) {
                res.json(counter);
            } else {
                const cnt = new NotificationCounter({ user: req.params.userId });
                cnt.save()
                    .then(n => {
                        res.json(cnt);
                    })
                    .catch(err => {
                        console.error(strings.DB_ERROR, err);
                        res.status(400).send(strings.DB_ERROR + err);
                    });
            }
        })
        .catch(err => {
            console.error(strings.DB_ERROR, err);
            res.status(400).send(strings.DB_ERROR + err);
        });
};

export const getNotifications = async (req, res) => {
    try {
        const userId = mongoose.Types.ObjectId(req.params.userId);
        const page = parseInt(req.params.page);
        const size = parseInt(req.params.size);

        // await Notification.deleteMany();
        // await NotificationCounter.deleteMany();
        // for (let i = 1; i <= 35; i++) {
        //     // 635a6ddd2c487867f759015e (poweredge-840@hotmail.com) Nouvelle commande ${i} effectuée.
        //     // 63497dc164b5af0b1d9971cb (akram.elassas@gmail.com) commande ${i} a été mis à jour.
        //     await new Notification({ user: '635a6e4b2c487867f759018b', message: `commande ${i} a été mis à jour.`, order: '635d0172fe37050901839dd8' }).save();
        // }

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
        ]);

        res.json(notifications);
    } catch (err) {
        console.error(strings.DB_ERROR, err);
        res.status(400).send(strings.DB_ERROR + err);
    }
};

export const markAsRead = async (req, res) => {

    try {
        const { ids: _ids } = req.body, ids = _ids.map(id => mongoose.Types.ObjectId(id));
        const { userId: _userId } = req.params, userId = mongoose.Types.ObjectId(_userId);

        const bulk = Notification.collection.initializeOrderedBulkOp();
        const notifications = await Notification.find({ _id: { $in: ids } });

        bulk.find({ _id: { $in: ids }, isRead: false }).update({ $set: { isRead: true } });
        bulk.execute(async (err, response) => {
            if (err) {
                console.error(`[notification.markAsRead] ${strings.DB_ERROR}`, err);
                return res.status(400).send(strings.DB_ERROR + err);
            }

            const counter = await NotificationCounter.findOne({ user: userId });
            counter.count -= notifications.filter(notification => !notification.isRead).length;
            await counter.save();

            return res.sendStatus(200);
        });

    } catch (err) {
        console.error(`[notification.markAsRead] ${strings.DB_ERROR}`, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};

export const markAsUnRead = async (req, res) => {

    try {
        const { ids: _ids } = req.body, ids = _ids.map(id => mongoose.Types.ObjectId(id));
        const { userId: _userId } = req.params, userId = mongoose.Types.ObjectId(_userId);

        const bulk = Notification.collection.initializeOrderedBulkOp();
        const notifications = await Notification.find({ _id: { $in: ids } });

        bulk.find({ _id: { $in: ids }, isRead: true }).update({ $set: { isRead: false } });
        bulk.execute(async (err, response) => {
            if (err) {
                console.error(`[notification.markAsUnRead] ${strings.DB_ERROR}`, err);
                return res.status(400).send(strings.DB_ERROR + err);
            }

            const counter = await NotificationCounter.findOne({ user: userId });
            counter.count += notifications.filter(notification => notification.isRead).length;
            await counter.save();

            return res.sendStatus(200);
        });

    } catch (err) {
        console.error(`[notification.markAsUnRead] ${strings.DB_ERROR}`, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};

export const deleteNotifications = async (req, res) => {
    try {
        const { ids: _ids } = req.body, ids = _ids.map(id => mongoose.Types.ObjectId(id));
        const { userId: _userId } = req.params, userId = mongoose.Types.ObjectId(_userId);

        const count = await Notification.find({ _id: { $in: ids }, isRead: false }).count();
        await Notification.deleteMany({ _id: { $in: ids } });

        const counter = await NotificationCounter.findOne({ user: userId });
        counter.count -= count;
        await counter.save();

        return res.sendStatus(200);

    } catch (err) {
        console.error(`[notification.delete] ${strings.DB_ERROR}`, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};