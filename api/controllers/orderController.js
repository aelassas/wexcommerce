import strings from '../config/app.config.js';
import Env from '../config/env.config.js';
import User from '../models/User.js';
import Token from '../models/Token.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Notification from '../models/Notification.js';
import NotificationCounter from '../models/NotificationCounter.js';
import { v1 as uuid } from 'uuid';
import escapeStringRegexp from 'escape-string-regexp';
import mongoose from 'mongoose';
import Helper from '../common/Helper.js';
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SC_SMTP_HOST;
const SMTP_PORT = process.env.SC_SMTP_PORT;
const SMTP_USER = process.env.SC_SMTP_USER;
const SMTP_PASS = process.env.SC_SMTP_PASS;
const SMTP_FROM = process.env.SC_SMTP_FROM;
const ADMIN_EMAIL = process.env.SC_ADMIN_EMAIL;
const BACKEND_HOST = process.env.SC_BACKEND_HOST;
const FRONTEND_HOST = process.env.SC_FRONTEND_HOST;

export const create = async (req, res) => {
    try {
        let _user, _order = {};
        const { user, order } = req.body;

        const admin = await User.findOne({ email: ADMIN_EMAIL });
        if (!admin) {
            const err = `[order.create] admin user ${ADMIN_EMAIL} not found.`;
            console.error(err);
            return res.status(204).send(err);
        }

        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        });

        if (user) {
            user.verified = false;
            user.blacklisted = false;

            _user = new User(user);
            await _user.save();

            const token = new Token({ user: _user._id, token: uuid() });
            await token.save();

            strings.setLanguage(_user.language);

            const mailOptions = {
                from: SMTP_FROM,
                to: _user.email,
                subject: strings.ACCOUNT_ACTIVATION_SUBJECT,
                html: '<p>' + strings.HELLO + user.fullName + ',<br><br>'
                    + strings.ACCOUNT_ACTIVATION_LINK + '<br><br>'

                    + Helper.joinURL(FRONTEND_HOST, 'activate')
                    + '?u=' + encodeURIComponent(_user._id)
                    + '&e=' + encodeURIComponent(_user.email)
                    + '&t=' + encodeURIComponent(token.token)
                    + '<br><br>'

                    + strings.REGARDS + '<br>'
                    + '</p>'
            };

            await transporter.sendMail(mailOptions);
        } else {
            _user = await User.findById(order.user);
        }

        // order
        _order.user = _user._id;
        _order.paymentType = order.paymentType;
        _order.total = order.total;

        // order.status
        if (order.paymentType === Env.PAYMENT_TYPE.CREDIT_CARD) {
            // TODO CMI
            _order.status = Env.ORDER_STATUS.PAID;
        } else if ([Env.PAYMENT_TYPE.COD, Env.PAYMENT_TYPE.WIRE_TRANSFER].includes(order.paymentType)) {
            _order.status = Env.ORDER_STATUS.PENDING;
        }

        // order.orderItems
        const __orderItems = [];
        const orderItems = [];
        for (const orderItem of order.orderItems) {
            const _orderItem = new OrderItem(orderItem);
            await _orderItem.save();
            await _orderItem.populate('product');
            orderItems.push(_orderItem);
            __orderItems.push(_orderItem._id);
        }
        _order.orderItems = __orderItems;

        const __order = new Order(_order);
        await __order.save();

        // user confirmation email
        strings.setLanguage(_user.language);

        let mailOptions = {
            from: SMTP_FROM,
            to: _user.email,
            subject: strings.ORDER_CONFIRMED_PART_1 + __order._id + strings.ORDER_CONFIRMED_PART_2,
            html: '<p>' + strings.HELLO + _user.fullName + ',<br><br>'
                + strings.ORDER_CONFIRMED_PART_1 + __order._id + strings.ORDER_CONFIRMED_PART_2 + '<br><br>'

                + orderItems.map((orderItem) => (
                    '<b>' + strings.PRODUCT + '</b> ' + orderItem.product.name + '<br>'
                    + '<b>' + strings.QUANTITY + '</b> ' + orderItem.quantity + '<br>'
                    + '<b>' + strings.PRICE + '</b> ' + Helper.formatNumber(orderItem.product.price) + ' ' + strings.CURRENCY + '<br>'
                )).join('<br>')

                + '<br><b>' + strings.TOTAL + '</b> ' + Helper.formatNumber(__order.total) + ' ' + strings.CURRENCY + '<br><br>'

                + '<b>' + strings.PAYMENT_TYPE + '</b> ' + (__order.paymentType === Env.PAYMENT_TYPE.CREDIT_CARD ? strings.CREDIT_CARD
                    : __order.paymentType === Env.PAYMENT_TYPE.COD ? strings.COD
                        : __order.paymentType === Env.PAYMENT_TYPE.WIRE_TRANSFER ? strings.WIRE_TRANSFER
                            : '') + '<br><br>'

                + (__order.paymentType === Env.PAYMENT_TYPE.CREDIT_CARD ? strings.PAID + '<br><br>' : '')

                + strings.ORDER_CONFIRMED_PART_3 + '<br><br>'
                + Helper.joinURL(FRONTEND_HOST, 'orders')
                + '?o=' + encodeURIComponent(__order._id)
                + '<br><br>'

                + strings.REGARDS + '<br>'
                + '</p>'
        };
        await transporter.sendMail(mailOptions);

        // admin email
        strings.setLanguage(admin.language);

        mailOptions = {
            from: SMTP_FROM,
            to: admin.email,
            subject: `${strings.NEW_ORDER_SUBJECT} ${__order._id}`,
            html: '<p>' + strings.HELLO + admin.fullName + ',<br><br>'
                + strings.NEW_ORDER_PART_1 + __order._id + strings.NEW_ORDER_PART_2 + '<br><br>'
                + strings.NEW_ORDER_PART_3 + '<br><br>'

                + BACKEND_HOST
                + '?o=' + encodeURIComponent(__order._id)
                + '<br><br>'

                + strings.REGARDS + '<br>'
                + '</p>'
        };
        await transporter.sendMail(mailOptions);

        // admin notification
        const message = `${_user.fullName} ${strings.NEW_ORDER} ${__order._id}.`;
        const notification = new Notification({ user: admin._id, message, order: __order._id });

        await notification.save();
        let counter = await NotificationCounter.findOne({ user: admin._id });
        if (counter) {
            counter.count++;
            await counter.save();
        } else {
            counter = new NotificationCounter({ user: admin._id, count: 1 });
            await counter.save();
        }

        return res.sendStatus(200);
    } catch (err) {
        console.error(`[order.create]  ${strings.DB_ERROR} ${req.body}`, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};

export const update = async (req, res) => {
    try {
        const { user: userId, id } = req.params;
        const { status } = req.body;

        const admin = await User.find({ _id: userId, type: Env.USER_TYPE.ADMIN });
        if (!admin) {
            const err = `[order.update] admin user ${userId} not found.`;
            console.error(err);
            return res.status(204).send(err);
        }

        const order = await Order
            .findById(id)
            .populate('user');

        if (order) {
            order.status = status;
            await order.save();

            const transporter = nodemailer.createTransport({
                host: SMTP_HOST,
                port: SMTP_PORT,
                auth: {
                    user: SMTP_USER,
                    pass: SMTP_PASS
                }
            });

            // user confirmation email
            const _user = order.user;

            strings.setLanguage(_user.language);

            const message = strings.ORDER_UPDATED_PART_1 + order._id + strings.ORDER_UPDATED_PART_2;

            const mailOptions = {
                from: SMTP_FROM,
                to: _user.email,
                subject: strings.ORDER_UPDATED_PART_1 + order._id + strings.ORDER_UPDATED_PART_2,
                html: '<p>' + strings.HELLO + _user.fullName + ',<br><br>'
                    + message + '<br><br>'
                    + strings.ORDER_CONFIRMED_PART_3 + '<br><br>'

                    + Helper.joinURL(FRONTEND_HOST, 'orders')
                    + '?o=' + encodeURIComponent(order._id)
                    + '<br><br>'

                    + strings.REGARDS + '<br>'
                    + '</p>'
            };
            await transporter.sendMail(mailOptions);

            // user notification
            const notification = new Notification({ user: _user._id, message, order: order._id });

            await notification.save();
            let counter = await NotificationCounter.findOne({ user: _user._id });
            if (counter) {
                counter.count++;
                await counter.save();
            } else {
                counter = new NotificationCounter({ user: _user._id, count: 1 });
                await counter.save();
            }

            return res.sendStatus(200);
        } else {
            return res.sendStatus(204);
        }
    } catch (err) {
        console.error(`[ordert.create]  ${strings.DB_ERROR} ${req.body}`, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { user: userId, id } = req.params;

        const admin = await User.find({ _id: userId, type: Env.USER_TYPE.ADMIN });
        if (!admin) {
            const err = `[order.deleteOrder] admin user ${userId} not found.`;
            console.error(err);
            return res.status(204).send(err);
        }

        Order.findByIdAndDelete(id, async (err, order) => {
            if (err) {
                console.error(`[order.delete]  ${strings.DB_ERROR} ${req.params.id}`, err);
                return res.status(400).send(strings.DB_ERROR + err);
            } else {
                try {
                    if (order) {
                        await OrderItem.deleteMany({ _id: { $in: order.orderItems } });
                        return res.sendStatus(200);
                    } else {
                        return res.sendStatus(204);
                    }
                } catch (err) {
                    console.error(`[order.delete]  ${strings.DB_ERROR} OrderId: ${id}`, err);
                    return res.status(400).send(strings.DB_ERROR + err);
                }
            }
        });
    } catch (err) {
        console.error(`[ordert.create]  ${strings.DB_ERROR} ${req.body}`, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};

export const getOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order
            .findById(id)
            .populate('user')
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product',
                }
            })
            .lean();

        if (order) {
            return res.json(order);
        } else {
            return res.sendStatus(204);
        }
    } catch (err) {
        console.error(`[order.getOrder]  ${strings.DB_ERROR} ${req.params.id}`, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};

export const getOrders = async (req, res) => {
    try {

        // let orderItem1 = new OrderItem({ product: '635c9ef7f0d1be5323e017ca', quantity: 1 }); // 779 DH
        // await orderItem1.save();

        // let orderItem2 = new OrderItem({ product: '635c9ea8f0d1be5323e017bf', quantity: 1 }); // 129 DH
        // await orderItem2.save();

        // let orderItem3 = new OrderItem({ product: '635c9ce6f0d1be5323e0176d', quantity: 1 }); // 259 DH
        // await orderItem3.save();

        // let orderItem4 = new OrderItem({ product: '635ba45ec385996e012c7fe3', quantity: 1 }); // 3749 DH
        // await orderItem4.save();

        // for (let i = 1; i <= 20; i++) {
        //     const orderItems = i % 2 === 0 ? [orderItem1._id] : i % 3 === 0 ? [orderItem2._id] : [orderItem3._id, orderItem4._id];
        //     const order = new Order({
        //         user: '635a6e4b2c487867f759018b',
        //         paymentType: i % 2 === 0 ? Env.PAYMENT_TYPE.CREDIT_CARD : Env.PAYMENT_TYPE.COD,
        //         total: i % 2 === 0 ? 779 : i % 3 === 0 ? 129 : (259 + 3749),
        //         status: i % 2 === 0 ? Env.ORDER_STATUS.PAID : Env.ORDER_STATUS.PENDING,
        //         orderItems
        //     });
        //     await order.save();
        // }

        // orderItem1 = new OrderItem({ product: '635ac292157b7d4b11a90763', quantity: 1 }); // 2799 DH
        // await orderItem1.save();

        // orderItem2 = new OrderItem({ product: '635ac2f4157b7d4b11a9076e', quantity: 1 }); // 3599 DH
        // await orderItem2.save();

        // orderItem3 = new OrderItem({ product: '635ca003f0d1be5323e017fb', quantity: 1 }); // 1499 DH
        // await orderItem3.save();

        // orderItem4 = new OrderItem({ product: '635c9daff0d1be5323e0178e', quantity: 1 }); // 169 DH
        // await orderItem4.save();

        // for (let i = 1; i <= 20; i++) {
        //     const orderItems = i % 2 === 0 ? [orderItem1._id] : i % 3 === 0 ? [orderItem2._id] : [orderItem3._id, orderItem4._id];
        //     const order = new Order({
        //         user: '635cff6c2c43b079ad9d25c8',
        //         paymentType: i % 2 === 0 ? Env.PAYMENT_TYPE.WIRE_TRANSFER : Env.PAYMENT_TYPE.CREDIT_CARD,
        //         total: i % 2 === 0 ? 2799 : i % 3 === 0 ? 3599 : (1499 + 169),
        //         status: i % 2 === 0 ? Env.ORDER_STATUS.CONFIRMED : i % 3 === 0 ? Env.ORDER_STATUS.IN_PROGRESS : Env.ORDER_STATUS.PAID,
        //         orderItems
        //     });
        //     await order.save();
        // }

        const { user: userId } = req.params;

        const user = await User.findOne({ _id: userId });

        if (!user) {
            const err = `[order.getOrders] user ${userId} not found.`;
            console.error(err);
            return res.status(204).send(err);
        }

        const page = parseInt(req.params.page);
        const size = parseInt(req.params.size);
        const keyword = escapeStringRegexp(req.query.s || '');
        const options = 'i';

        const { paymentTypes, statuses } = req.body;
        let $match;
        if (user.type === Env.USER_TYPE.USER) {
            $match = {
                $and: [
                    { 'user._id': { $eq: mongoose.Types.ObjectId(userId) } },
                    { paymentType: { $in: paymentTypes } },
                    { status: { $in: statuses } }
                ]
            };
        } else if (user.type === Env.USER_TYPE.ADMIN) {
            $match = {
                $and: [
                    { paymentType: { $in: paymentTypes } },
                    { status: { $in: statuses } }
                ]
            };
        }

        let isObjectId = false;
        if (keyword) {
            isObjectId = mongoose.isValidObjectId(keyword);

            if (isObjectId) {
                $match.$and.push({ _id: { $eq: mongoose.Types.ObjectId(keyword) } });
            }
        }

        const { from, to } = req.body;

        if (from) {
            $match.$and.push({ createdAt: { $gt: new Date(from) } });
        }
        if (to) {
            $match.$and.push({ createdAt: { $lt: new Date(to) } });
        }

        // page search (aggregate)
        const data = await Order.aggregate([
            {
                $lookup: {
                    from: 'User',
                    let: { userId: '$user' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$userId'] }
                            }
                        }
                    ],
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
            { $match },
            {
                $lookup: {
                    from: 'OrderItem',
                    let: { orderItems: '$orderItems' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$orderItems'] }
                            }
                        },
                        {
                            $lookup: {
                                from: 'Product',
                                let: { productId: '$product' },
                                pipeline: [
                                    {
                                        // $match: {
                                        //     $and: [
                                        //         { $expr: { $eq: ['$_id', '$$productId'] } },
                                        //         isObjectId ? {} : { $expr: { $regexMatch: { input: '$name', regex: keyword, options } } }
                                        //     ]
                                        // }
                                        $match: { $expr: { $eq: ['$_id', '$$productId'] } }
                                    }
                                ],
                                as: 'product'
                            }
                        },
                        { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
                    ],
                    as: 'orderItems'
                }
            },
            {
                $match:
                    isObjectId ? {}
                        : {
                            $or: [
                                { 'orderItems.product.name': { $regex: keyword, $options: options } },
                                { 'user.fullName': { $regex: keyword, $options: options } }
                            ]
                        }
            },
            {
                $match: { 'orderItems': { $not: { $size: 0 } } }
            },
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
        ], { collation: { locale: Env.DEFAULT_LANGUAGE, strength: 2 } });

        if (data.length > 0) {
            const orders = data[0].resultData;

            for (const order of orders) {
                const { _id, fullName } = order.user;
                order.user = { _id, fullName };
            }
        }

        return res.json(data);
    } catch (err) {
        console.error(`[order.getOrders]  ${strings.DB_ERROR}`, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};