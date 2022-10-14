import strings from '../config/app.config.js';
import Subscription from '../models/Subscription.js';
import Value from '../models/Value.js';
import User from '../models/User.js';
import Token from '../models/Token.js';
import Notification from '../models/Notification.js';
import NotificationCounter from '../models/NotificationCounter.js';
import Env from '../config/env.config.js';
import escapeStringRegexp from 'escape-string-regexp';
import nodemailer from 'nodemailer';
import { v1 as uuid } from 'uuid';
import Helper from '../common/Helper.js';

const SMTP_HOST = process.env.SC_SMTP_HOST;
const SMTP_PORT = process.env.SC_SMTP_PORT;
const SMTP_USER = process.env.SC_SMTP_USER;
const SMTP_PASS = process.env.SC_SMTP_PASS;
const SMTP_FROM = process.env.SC_SMTP_FROM;
const FRONTEND_HOST = process.env.SC_FRONTEND_HOST;
const ADMIN_EMAIL = process.env.SC_ADMIN_EMAIL;

export const validate = async (req, res) => {
    const language = req.body.language;
    const keyword = escapeStringRegexp(req.body.value);
    const options = 'i';

    const subscriptions = await Subscription.aggregate([
        {
            $lookup: {
                from: 'Value',
                let: { name: '$name' },
                pipeline: [
                    {
                        $match: {
                            $and: [
                                { $expr: { $in: ['$_id', '$$name'] } },
                                { $expr: { $eq: ['$language', language] } },
                                { $expr: { $regexMatch: { input: '$value', regex: `^${keyword}$`, options } } }
                            ]
                        }
                    }
                ],
                as: 'nameValue'
            }
        },
        { $unwind: { path: '$nameValue', preserveNullAndEmptyArrays: false } },
        {
            $count: 'count'
        }
    ]);

    if (subscriptions.length > 0 && subscriptions[0].count > 0) {
        return res.sendStatus(204);
    }

    return res.sendStatus(200);
};

export const validateVideosPerMonth = (req, res) => {
    const { videosPerMonth } = req.params;

    Subscription.find({ videosPerMonth })
        .limit(1)
        .count()
        .then(count => {
            if (count === 1) {
                return res.sendStatus(204);
            }
            return res.sendStatus(200);
        })
        .catch(err => {
            console.error(`[subscription.checkSubscriptionVideosPerMonth]  ${strings.DB_ERROR} ${id}`, err);
            return res.status(400).send(strings.DB_ERROR + err);
        });
};

export const create = async (req, res) => {
    try {
        const { nameValues, descriptionValues, videosPerMonth, price } = req.body;

        const _nameValues = [];
        for (let i = 0; i < nameValues.length; i++) {
            const value = nameValues[i];
            const _value = new Value({
                language: value.language,
                value: value.value
            });
            await _value.save();
            _nameValues.push(_value._id);
        }

        const _descriptionValues = [];
        for (let i = 0; i < descriptionValues.length; i++) {
            const value = nameValues[i];
            const _value = new Value({
                language: value.language,
                value: value.value
            });
            await _value.save();
            _descriptionValues.push(_value._id);
        }

        const subscription = new Subscription({ name: _nameValues, description: _descriptionValues, videosPerMonth, price });
        await subscription.save();
        return res.sendStatus(200);

    } catch (err) {
        console.error(strings.ERROR, err);
        return res.status(400).send(strings.ERROR + err);
    }
};

export const update = (req, res) => {
    Subscription.findById(req.params.id)
        .populate('name')
        .populate('description')
        .then(async subscription => {
            if (subscription) {
                const { nameValues, descriptionValues, videosPerMonth, price } = req.body;
                for (let i = 0; i < nameValues.length; i++) {
                    const name = nameValues[i];
                    const _value = subscription.name.filter(value => value.language === name.language)[0];
                    if (_value) {
                        _value.value = name.value;
                        await _value.save();
                    } else {
                        const value = new Value({
                            language: value.language,
                            value: value.value
                        });
                        await value.save();
                        subscription.name.push(value._id);
                    }
                }

                for (let i = 0; i < descriptionValues.length; i++) {
                    const desc = descriptionValues[i];
                    const _value = subscription.description.filter(value => value.language === desc.language)[0];
                    if (_value) {
                        _value.value = desc.value;
                        await _value.save();
                    } else {
                        const value = new Value({
                            language: value.language,
                            value: value.value
                        });
                        await value.save();
                        subscription.description.push(value._id);
                    }
                }

                subscription.videosPerMonth = videosPerMonth;
                subscription.price = price;
                await subscription.save();
                return res.sendStatus(200);
            } else {
                console.error('[subscription.update] Subscription not found:', req.body);
                return res.sendStatus(204);
            }
        })
        .catch(err => {
            console.error(`[subscription.update]  ${strings.DB_ERROR} ${req.body}`, err);
            return res.status(400).send(strings.DB_ERROR + err);
        });
};

export const checkSubscription = (req, res) => {
    const { id } = req.params;

    User.find({ subscription: id })
        .limit(1)
        .count()
        .then(count => {
            if (count === 1) {
                return res.sendStatus(200);
            }
            return res.sendStatus(204);
        })
        .catch(err => {
            console.error(`[subscription.checkSubscription]  ${strings.DB_ERROR} ${id}`, err);
            return res.status(400).send(strings.DB_ERROR + err);
        });
};

export const deleteSubscription = async (req, res) => {
    try {
        const id = req.params.id;

        Subscription.findByIdAndDelete(id, async (err, subscription) => {
            if (err) {
                console.error(`[subscription.delete]  ${strings.DB_ERROR} ${req.params.id}`, err);
                return res.status(400).send(strings.DB_ERROR + err);
            } else {
                try {
                    await Value.deleteMany({ _id: { $in: subscription.name } });
                    await Value.deleteMany({ _id: { $in: subscription.description } });
                    return res.sendStatus(200);
                } catch (err) {
                    console.error(`[subscription.delete]  ${strings.DB_ERROR} ${req.params.id}`, err);
                    return res.status(400).send(strings.DB_ERROR + err);
                }
            }
        });
    } catch (err) {
        console.error(strings.ERROR, err);
        return res.status(400).send(strings.ERROR + err);
    }
};

export const getSubscription = async (req, res) => {
    Subscription.findById(req.params.id)
        .populate('name')
        .populate('description')
        .lean()
        .then(subscription => {
            if (subscription) {
                subscription._name = subscription.name.filter(value => value.language === req.params.language)[0].value;
                subscription._description = subscription.description.filter(value => value.language === req.params.language)[0].value;
                return res.json(subscription);
            } else {
                console.error('[subscription.getSubscription] Subscription not found:', req.params.id);
                return res.sendStatus(204);
            }
        })
        .catch(err => {
            console.error(`[subscription.getSubscription]  ${strings.DB_ERROR} ${req.params.id}`, err);
            return res.status(400).send(strings.DB_ERROR + err);
        });
};

export const getSubscriptions = async (req, res) => {
    try {
        const language = req.params.language;

        // for (let i = 1; i <= 20; i++) {
        //     const name_fr = new Value({ language: 'fr', value: `Abonnement ${i}` });
        //     await name_fr.save();
        //     const name_en = new Value({ language: 'en', value: `Subscription ${i}` });
        //     await name_en.save();
        //     const desc_fr = new Value({ language: 'fr', value: `Abonnement mensuel ${i}` });
        //     await desc_fr.save();
        //     const desc_en = new Value({ language: 'en', value: `Monthly subscription ${i}` });
        //     await desc_en.save();
        //     const videosPerMonth = i * 10;
        //     const sub = new Subscription({ name: [name_fr._id, name_en._id], description: [desc_fr._id, desc_en._id], videosPerMonth });
        //     await sub.save();
        // }

        // await Value.deleteMany({ value: { $or: [{ $regex: 'Abonnement' }, { $regex: 'Subscription' }] } });
        // await Subscription.deleteMany();

        // const subs = await Subscription.find();
        // for (let i = 0; i < subs.length; i++) {
        //     const sub = subs[i];
        //     sub.price = 100 + i * 10;
        //     await sub.save();
        // }

        const subscriptions = await Subscription.aggregate([
            {
                $lookup: {
                    from: 'Value',
                    let: { name: '$name' },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $in: ['$_id', '$$name'] } },
                                    { $expr: { $eq: ['$language', language] } }
                                ]
                            }
                        }
                    ],
                    as: 'nameValue'
                }
            },
            { $unwind: { path: '$nameValue', preserveNullAndEmptyArrays: false } },
            { $addFields: { name: '$nameValue.value' } },
            {
                $lookup: {
                    from: 'Value',
                    let: { description: '$description' },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $in: ['$_id', '$$description'] } },
                                    { $expr: { $eq: ['$language', language] } }
                                ]
                            }
                        }
                    ],
                    as: 'descriptionValue'
                }
            },
            { $unwind: { path: '$descriptionValue', preserveNullAndEmptyArrays: false } },
            { $addFields: { description: '$descriptionValue.value' } },
            { $project: { nameValue: 0, descriptionValue: 0 } },
            { $sort: { videosPerMonth: 1 } }
        ], { collation: { locale: Env.DEFAULT_LANGUAGE, strength: 2 } });

        return res.json(subscriptions);
    } catch (err) {
        console.error(`[subscription.getSubscriptions]  ${strings.DB_ERROR} ${req.query.s}`, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};

export const subscribe = async (req, res) => {
    try {
        const payload = req.body;
        payload.type = Env.USER_TYPE.USER;
        payload.active = false;
        payload.verified = false;

        const user = new User(payload);
        await user.save();

        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        });

        const token = new Token({ user: user._id, token: uuid() });
        await token.save();

        strings.setLanguage(user.language);

        const mailOptions = {
            from: SMTP_FROM,
            to: user.email,
            subject: strings.ACCOUNT_ACTIVATION_SUBJECT,
            html: '<p>' + strings.HELLO + user.fullName + ',<br><br>'
                + strings.ACCOUNT_ACTIVATION_LINK + '<br><br>'

                + Helper.joinURL(FRONTEND_HOST, 'activate')
                + '/?u=' + encodeURIComponent(user._id)
                + '&e=' + encodeURIComponent(user.email)
                + '&t=' + encodeURIComponent(token.token)
                + '<br><br>'

                + strings.REGARDS + '<br>'
                + '</p>'
        };
        await transporter.sendMail(mailOptions);

        // Notify admin
        const admin = await User.findOne({ email: ADMIN_EMAIL });
        if (admin) {
            const subscription = await Subscription.findById(payload.subscription)
                .populate('name')
                .populate('description')
                .lean();

            if (subscription) {
                subscription._name = subscription.name.filter(value => value.language === admin.language)[0].value;
                subscription._description = subscription.description.filter(value => value.language === admin.language)[0].value;

                strings.setLanguage(admin.language);
                const message = `${user.email} ${strings.SUBSCRIBED_TO} ${subscription._name}.`;

                const notification = new Notification({ user: admin._id, message });
                await notification.save();

                const counter = await NotificationCounter.findOne({ user: admin._id });

                if (counter) {
                    counter.count++;
                    await counter.save();
                } else {
                    await (new NotificationCounter({ user: amdin._id, count: 1 })).save();
                }

                const mailOptions = {
                    from: SMTP_FROM,
                    to: admin.email,
                    subject: strings.NEW_SUBSCRIPTION,
                    html: '<p>' + strings.HELLO + admin.fullName + ',<br><br>'
                        + message
                        + '<br><br>'

                        + strings.REGARDS + '<br>'
                        + '</p>'
                };
                await transporter.sendMail(mailOptions);

            } else {
                console.error(`[subscription.subscribe]  ${strings.DB_ERROR}`, `Subscription (${payload.subscription}) not found`);
                return res.status(400).send(strings.DB_ERROR + err);
            }

        } else {
            console.error(`[subscription.subscribe]  ${strings.DB_ERROR}`, `Admin user (${ADMIN_EMAIL}) not found`);
            return res.status(400).send(strings.DB_ERROR + err);
        }

        return res.sendStatus(200);
    } catch (err) {
        console.error(`[subscription.subscribe]  ${strings.DB_ERROR}`, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};