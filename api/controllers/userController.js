import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { v1 as uuid } from 'uuid';
import escapeStringRegexp from 'escape-string-regexp';
import strings from '../config/app.config.js';
import Env from '../config/env.config.js';
import User from '../models/User.js';
import Token from '../models/Token.js';
import mongoose from 'mongoose';
import * as Helper from '../common/Helper.js';

const DEFAULT_LANGUAGE = process.env.WC_DEFAULT_LANGUAGE;
const HTTPS = process.env.WC_HTTPS.toLowerCase() === 'true';
const JWT_SECRET = process.env.WC_JWT_SECRET;
const JWT_EXPIRE_AT = parseInt(process.env.WC_JWT_EXPIRE_AT);
const SMTP_HOST = process.env.WC_SMTP_HOST;
const SMTP_PORT = process.env.WC_SMTP_PORT;
const SMTP_USER = process.env.WC_SMTP_USER;
const SMTP_PASS = process.env.WC_SMTP_PASS;
const SMTP_FROM = process.env.WC_SMTP_FROM;
const BACKEND_HOST = process.env.WC_BACKEND_HOST;
const FRONTEND_HOST = process.env.WC_FRONTEND_HOST;

const getStatusMessage = (lang, msg) => {
    if (lang === 'ar') {
        return '<!DOCTYPE html><html dir="rtl" lang="ar"><head></head><body><p>' + msg + '</p></body></html>';
    }
    return '<!DOCTYPE html><html lang="' + lang + '"><head></head><body><p>' + msg + '</p></body></html>';
};

export const signup = (req, res) => {
    const { body } = req;
    body.active = true;
    body.verified = false;
    body.blacklisted = false;
    body.type = Env.USER_TYPE.USER;

    const salt = bcrypt.genSaltSync(10);
    const password = body.password;
    const passwordHash = bcrypt.hashSync(password, salt);
    body.password = passwordHash;

    const user = new User(body);
    user.save()
        .then(user => {

            // generate token and save
            const token = new Token({ user: user._id, token: uuid() });

            token.save()
                .then(token => {
                    // Send email
                    strings.setLanguage(user.language);

                    const transporter = nodemailer.createTransport({
                        host: SMTP_HOST,
                        port: SMTP_PORT,
                        auth: {
                            user: SMTP_USER,
                            pass: SMTP_PASS
                        }
                    });
                    const mailOptions = {
                        from: SMTP_FROM,
                        to: user.email,
                        subject: strings.ACCOUNT_ACTIVATION_SUBJECT,
                        html: '<p>' + strings.HELLO + user.fullName + ',<br><br>'
                            + strings.ACCOUNT_ACTIVATION_LINK
                            + '<br><br>http' + (HTTPS ? 's' : '') + ':\/\/' + req.headers.host + '\/api/confirm-email\/' + user.email + '\/' + token.token + '<br><br>'
                            + strings.REGARDS + '<br>'
                            + '</p>'
                    };
                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) {
                            console.error(strings.SMTP_ERROR, err);
                            return res.status(400).send(strings.SMTP_ERROR + err);;
                        } else {
                            return res.sendStatus(200);
                        }
                    });
                })
                .catch(err => {
                    console.error(strings.DB_ERROR, err);
                    return res.status(400).send(getStatusMessage(user.language, strings.DB_ERROR + err));
                });
        })
        .catch(err => {
            console.error(strings.DB_ERROR, err);
            return res.status(400).send(strings.DB_ERROR + err);
        });
};

export const adminSignup = (req, res) => {
    const { body } = req;
    body.active = true;
    body.verified = false;
    body.blacklisted = false;
    body.type = Env.USER_TYPE.ADMIN;

    const salt = bcrypt.genSaltSync(10);
    const password = body.password;
    const passwordHash = bcrypt.hashSync(password, salt);
    body.password = passwordHash;

    const user = new User(body);
    user.save()
        .then(user => {

            // generate token and save
            const token = new Token({ user: user._id, token: uuid() });

            token.save()
                .then(token => {
                    // Send email
                    strings.setLanguage(user.language);

                    const transporter = nodemailer.createTransport({
                        host: SMTP_HOST,
                        port: SMTP_PORT,
                        auth: {
                            user: SMTP_USER,
                            pass: SMTP_PASS
                        }
                    });
                    const mailOptions = {
                        from: SMTP_FROM,
                        to: user.email,
                        subject: strings.ACCOUNT_ACTIVATION_SUBJECT,
                        html: '<p>' + strings.HELLO + user.fullName + ',<br><br>'
                            + strings.ACCOUNT_ACTIVATION_LINK
                            + '<br><br>http' + (HTTPS ? 's' : '') + ':\/\/' + req.headers.host + '\/api/confirm-email\/' + user.email + '\/' + token.token + '<br><br>'
                            + strings.REGARDS + '<br>'
                            + '</p>'
                    };
                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) {
                            console.error(strings.SMTP_ERROR, err);
                            return res.status(400).send(strings.SMTP_ERROR + err);;
                        } else {
                            return res.sendStatus(200);
                        }
                    });
                })
                .catch(err => {
                    console.error(strings.DB_ERROR, err);
                    return res.status(400).send(getStatusMessage(user.language, strings.DB_ERROR + err));
                });
        })
        .catch(err => {
            console.error(strings.DB_ERROR, err);
            return res.status(400).send(strings.DB_ERROR + err);
        });
};

export const confirmEmail = (req, res) => {
    Token.findOne({ token: req.params.token }, (err, token) => {
        User.findOne({ email: req.params.email }, (err, user) => {
            strings.setLanguage(user.language);
            // token is not found into database i.e. token may have expired
            if (!token) {
                console.error(strings.ACCOUNT_ACTIVATION_LINK_EXPIRED, req.params);
                return res.status(400).send(getStatusMessage(user.language, strings.ACCOUNT_ACTIVATION_LINK_EXPIRED));
            }
            // if token is found then check valid user
            else {
                // not valid user
                if (!user) {
                    console.error('[user.confirmEmail] User not found', req.params);
                    return res.status(401).send(getStatusMessage(user.language, strings.ACCOUNT_ACTIVATION_LINK_ERROR));
                }
                // user is already verified
                else if (user.verified) {
                    return res.status(200).send(getStatusMessage(user.language, strings.ACCOUNT_ACTIVATION_ACCOUNT_VERIFIED));
                }
                // verify user
                else {
                    // change verified to true
                    user.verified = true;
                    user.verifiedAt = Date.now();
                    user.save((err) => {
                        // error occur
                        if (err) {
                            console.error('[user.confirmEmail] ' + strings.DB_ERROR + ' ' + req.params, err);
                            return res.status(500).send(getStatusMessage(user.language, err.message));
                        }
                        // account successfully verified
                        else {
                            return res.status(200).send(getStatusMessage(user.language, strings.ACCOUNT_ACTIVATION_SUCCESS));
                        }
                    });

                }
            }
        });
    });
};

export const resendLink = (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, user) => {

        // user is not found into database
        if (!user) {
            console.error('[user.resendLink] User not found:', req.params);
            return res.status(400).send(getStatusMessage(DEFAULT_LANGUAGE, strings.ACCOUNT_ACTIVATION_RESEND_ERROR));
        }
        // user has been already verified
        else if (user.verified) {
            return res.status(200).send(getStatusMessage(user.language, strings.ACCOUNT_ACTIVATION_ACCOUNT_VERIFIED));
        }
        // send verification link
        else {
            // generate token and save
            const token = new Token({ user: user._id, token: uuid() });

            token.save((err) => {
                if (err) {
                    console.error('[user.resendLink] ' + strings.DB_ERROR, req.params);
                    return res.status(500).send(getStatusMessage(user.language, err.message));
                }

                // Send email
                const transporter = nodemailer.createTransport({
                    host: SMTP_HOST,
                    port: SMTP_PORT,
                    auth: {
                        user: SMTP_USER,
                        pass: SMTP_PASS
                    }
                });

                strings.setLanguage(user.language);
                const mailOptions = { from: SMTP_FROM, to: user.email, subject: strings.ACCOUNT_ACTIVATION_SUBJECT, html: '<p ' + (user.language === 'ar' ? 'dir="rtl"' : ')') + '>' + strings.HELLO + user.fullName + ',<br> <br>' + strings.ACCOUNT_ACTIVATION_LINK + '<br><br>http' + (HTTPS ? 's' : '') + ':\/\/' + req.headers.host + '\/api/confirm-email\/' + user.email + '\/' + token.token + '<br><br>' + strings.REGARDS + '<br>' + '</p>' };
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.error('[user.resendLink] ' + strings.SMTP_ERROR, req.params);
                        return res.status(500).send(getStatusMessage(user.language, strings.ACCOUNT_ACTIVATION_TECHNICAL_ISSUE + ' ' + err.response));
                    }
                    return res.status(200).send(getStatusMessage(user.language, strings.ACCOUNT_ACTIVATION_EMAIL_SENT_PART_1 + user.email + strings.ACCOUNT_ACTIVATION_EMAIL_SENT_PART_2));
                });
            });
        }
    });
};

export const validateEmail = async (req, res) => {
    try {
        const exists = await User.exists({ email: req.body.email });

        if (exists) {
            return res.sendStatus(204);
        } else { // email does not exist in db (can be added)
            return res.sendStatus(200);
        }
    } catch (err) {
        console.error('[user.validateEmail] ' + strings.DB_ERROR + ' ' + req.body.email, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};

export const isAdmin = async (req, res) => {
    try {
        const exists = await User.exists({ email: req.body.email, type: Env.USER_TYPE.ADMIN });

        if (exists) {
            return res.sendStatus(200);
        } else {
            return res.sendStatus(204);
        }
    } catch (err) {
        console.error('[user.isAdmin] ' + strings.DB_ERROR + ' ' + req.body.email, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};

export const isUser = async (req, res) => {
    try {
        const exists = await User.exists({ email: req.body.email, type: Env.USER_TYPE.USER });

        if (exists) {
            return res.sendStatus(200);
        } else {
            return res.sendStatus(204);
        }
    } catch (err) {
        console.error('[user.isUser] ' + strings.DB_ERROR + ' ' + req.body.email, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};


export const resend = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (user) {
            if (![Env.APP_TYPE.FRONTEND, Env.APP_TYPE.BACKEND].includes(req.params.type)
                || (req.params.type === Env.APP_TYPE.BACKEND && user.type === Env.USER_TYPE.USER)
                || (req.params.type === Env.APP_TYPE.FRONTEND && user.type !== Env.USER_TYPE.USER)
            ) {
                return res.sendStatus(403);
            } else {
                user.active = false;

                await user.save();

                // generate token and save
                await Token.deleteMany({ user: user._id });
                const token = new Token({ user: user._id, token: uuid() });

                await token.save();

                // Send email
                strings.setLanguage(user.language);

                const reset = req.params.reset === 'true';

                const transporter = nodemailer.createTransport({
                    host: SMTP_HOST,
                    port: SMTP_PORT,
                    auth: {
                        user: SMTP_USER,
                        pass: SMTP_PASS
                    }
                });
                const mailOptions = {
                    from: SMTP_FROM,
                    to: user.email,
                    subject: (reset ? strings.PASSWORD_RESET_SUBJECT : strings.ACCOUNT_ACTIVATION_SUBJECT),
                    html: '<p>' + strings.HELLO + user.fullName + ',<br><br>'
                        + (reset ? strings.PASSWORD_RESET_LINK : strings.ACCOUNT_ACTIVATION_LINK) + '<br><br>'

                        + Helper.joinURL(user.type === Env.USER_TYPE.USER ? FRONTEND_HOST : BACKEND_HOST, reset ? 'reset-password' : 'activate')
                        + '/?u=' + encodeURIComponent(user._id)
                        + '&e=' + encodeURIComponent(user.email)
                        + '&t=' + encodeURIComponent(token.token)
                        + '<br><br>'

                        + strings.REGARDS + '<br>'
                        + '</p>'
                };
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.error(strings.SMTP_ERROR, err);
                        return res.status(400).send(strings.SMTP_ERROR + err);;
                    } else {
                        return res.sendStatus(200);
                    }
                });
            }
        } else {
            return res.sendStatus(204);
        }
    } catch (err) {
        console.error(strings.DB_ERROR, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};

export const activate = (req, res) => {
    User.findById(req.body.userId)
        .then(user => {
            if (user) {
                Token.find({ token: req.body.token })
                    .then(token => {
                        if (token) {
                            const salt = bcrypt.genSaltSync(10);
                            const password = req.body.password;
                            const passwordHash = bcrypt.hashSync(password, salt);
                            user.password = passwordHash;

                            user.active = true;
                            user.verified = true;
                            user.save()
                                .then(() => {
                                    return res.sendStatus(200);
                                })
                                .catch(err => {
                                    console.error(strings.DB_ERROR, err);
                                    return res.status(400).send(strings.DB_ERROR + err);
                                });
                        } else {
                            return res.sendStatus(204);
                        }
                    })
                    .catch(err => {
                        console.error(strings.DB_ERROR, err);
                        return res.status(400).send(strings.DB_ERROR + err);
                    });
            }
        })
        .catch(err => {
            console.error(strings.DB_ERROR, err);
            return res.status(400).send(strings.DB_ERROR + err);
        });
};

export const checkToken = (req, res) => {
    User.findOne({ _id: mongoose.Types.ObjectId(req.params.userId), email: req.params.email })
        .then(user => {
            if (user) {
                if (![Env.APP_TYPE.FRONTEND, Env.APP_TYPE.BACKEND].includes(req.params.type)
                    || (req.params.type === Env.APP_TYPE.BACKEND && user.type === Env.USER_TYPE.USER)
                    || (req.params.type === Env.APP_TYPE.FRONTEND && user.type !== Env.USER_TYPE.USER)
                    || user.active
                ) {
                    return res.sendStatus(403);
                } else {
                    Token.findOne({ user: mongoose.Types.ObjectId(req.params.userId), token: req.params.token })
                        .then(token => {
                            if (token) {
                                return res.sendStatus(200);
                            } else {
                                return res.sendStatus(204);
                            }
                        })
                        .catch(err => {
                            console.error(strings.DB_ERROR, err);
                            return res.status(400).send(strings.DB_ERROR + err);
                        });
                }
            } else {
                return res.sendStatus(403);
            }
        })
        .catch(err => {
            console.error(strings.DB_ERROR, err);
            return res.status(400).send(strings.DB_ERROR + err);
        });
};

export const deleteTokens = (req, res) => {
    Token.deleteMany({ user: mongoose.Types.ObjectId(req.params.userId) })
        .then((result) => {
            if (result.deletedCount > 0) {
                return res.sendStatus(200);
            } else {
                return res.sendStatus(400);
            }
        })
        .catch(err => {
            console.error(strings.DB_ERROR, err);
            return res.status(400).send(strings.DB_ERROR + err);
        });
};

export const signin = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!req.body.password
                || !user
                || !user.password
                || (![Env.APP_TYPE.FRONTEND, Env.APP_TYPE.BACKEND].includes(req.params.type))
                || (req.params.type === Env.APP_TYPE.BACKEND && user.type === Env.USER_TYPE.USER)
                || (req.params.type === Env.APP_TYPE.FRONTEND && user.type !== Env.USER_TYPE.USER)
            ) {
                return res.sendStatus(204);
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(async passwordMatch => {
                        if (passwordMatch) {
                            const payload = { id: user._id };

                            let options = { expiresIn: JWT_EXPIRE_AT };
                            if (req.body.stayConnected) options = {};

                            const token = jwt.sign(payload, JWT_SECRET, options);

                            return res.status(200).send({
                                id: user._id,
                                email: user.email,
                                fullName: user.fullName,
                                language: user.language,
                                enableEmailNotifications: user.enableEmailNotifications,
                                accessToken: token,
                                blacklisted: user.blacklisted,
                                avatar: user.avatar
                            });
                        } else {
                            return res.sendStatus(204);
                        }
                    })
                    .catch(err => {
                        console.error(strings.ERROR, err);
                        return res.status(400).send(strings.ERROR + err);
                    });
            }
        })
        .catch(err => {
            console.error(strings.DB_ERROR, err);
            return res.status(400).send(strings.DB_ERROR + err);
        });
};

export const validateAccessToken = (req, res) => {
    return res.sendStatus(200);
};

export const getUser = (req, res) => {
    User.findById(req.params.id, {
        email: 1,
        fullName: 1,
        phone: 1,
        address: 1,
        verified: 1,
        language: 1,
        type: 1,
        subscription: 1
    })
        .lean()
        .then(user => {
            if (!user) {
                console.error('[user.getUser] User not found:', req.params);
                res.sendStatus(204);
            } else {
                return res.json(user);
            }
        })
        .catch(err => {
            console.error(strings.DB_ERROR, err);
            return res.status(400).send(strings.DB_ERROR + err);
        });
};

export const update = (req, res) => {
    User.findById(req.body._id)
        .then(user => {
            if (!user) {
                console.error('[user.update] User not found:', req.body.email);
                return res.sendStatus(204);
            } else {
                const { fullName, phone, address } = req.body;

                user.fullName = fullName;
                user.phone = phone;
                user.address = address;

                user.save()
                    .then(() => {
                        return res.sendStatus(200);
                    })
                    .catch(err => {
                        console.error(strings.DB_ERROR, err);
                        return res.status(400).send(strings.DB_ERROR + err);
                    });

            }
        }).catch(err => {
            console.error(strings.DB_ERROR, err);
            return res.status(400).send(strings.DB_ERROR + err);
        });
};

export const updateLanguage = (req, res) => {
    User.findById(req.body.id)
        .then(user => {
            if (!user) {
                console.error('[user.updateLanguage] User not found:', req.body.id);
                return res.sendStatus(204);
            } else {
                user.language = req.body.language;
                user.save()
                    .then(() => {
                        return res.sendStatus(200);
                    })
                    .catch(err => {
                        console.error(strings.DB_ERROR, err);
                        return res.status(400).send(strings.DB_ERROR + err);
                    });

            }
        }).catch(err => {
            console.error(strings.DB_ERROR, err);
            return res.status(400).send(strings.DB_ERROR + err);
        });
};

export const checkPassword = (req, res) => {
    User.findById(req.params.id)
        .then(user => {
            if (user) {
                bcrypt.compare(req.params.password, user.password).then(passwordMatch => {
                    if (passwordMatch) {
                        return res.sendStatus(200);
                    }
                    else {
                        return res.sendStatus(204);
                    }
                });
            } else {
                console.error('[user.checkPassword] User not found:', req.params.id);
                return res.sendStatus(204);
            }
        })
        .catch(err => {
            console.error(strings.DB_ERROR, err);
            return res.status(400).send(strings.DB_ERROR + err);
        });;
};

export const changePassword = (req, res) => {
    User.findOne({ _id: req.body._id })
        .then(user => {

            if (!user) {
                console.error('[user.changePassword] User not found:', req.body._id);
                return res.sendStatus(204);
            }

            const changePassword = () => {
                const salt = bcrypt.genSaltSync(10);
                const password = req.body.newPassword;
                const passwordHash = bcrypt.hashSync(password, salt);
                user.password = passwordHash;

                user.save()
                    .then(() => {
                        return res.sendStatus(200);
                    })
                    .catch(err => {
                        console.error(strings.DB_ERROR, err);
                        return res.status(400).send(strings.DB_ERROR + err);
                    });
            };

            if (req.body.strict) {
                bcrypt.compare(req.body.password, user.password)
                    .then(async passwordMatch => {
                        if (passwordMatch) {
                            changePassword();
                        }
                        else {
                            return res.sendStatus(204);
                        }
                    });
            }
            else {
                changePassword();
            }
        })
        .catch(err => {
            console.error(strings.DB_ERROR, err);
            return res.status(400).send(strings.DB_ERROR + err);
        });
};

export const getUsers = async (req, res) => {

    try {
        let keyword = req.query.s || '';
        const options = 'i';
        const page = parseInt(req.params.page);
        const size = parseInt(req.params.size);
        const language = req.params.language;

        let $match;
        if (keyword) {
            const isObjectId = mongoose.isValidObjectId(keyword);
            if (isObjectId) {
                $match = {
                    $and: [
                        {
                            type: Env.USER_TYPE.USER
                        },
                        {
                            _id: { $eq: mongoose.Types.ObjectId(keyword) }
                        }
                    ]
                };
            } else {
                keyword = escapeStringRegexp(keyword);

                $match = {
                    $and: [
                        {
                            type: Env.USER_TYPE.USER
                        },
                        {
                            $or: [{ fullName: { $regex: keyword, $options: options } }, { email: { $regex: keyword, $options: options } }]
                        }
                    ]
                };
            }
        } else {
            $match = { type: Env.USER_TYPE.USER };
        }

        const users = await User.aggregate([
            {
                $match
            },
            {
                $lookup: {
                    from: 'Subscription',
                    let: { subscription: '$subscription' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$subscription'] }
                            }
                        },
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
                    ],
                    as: 'subscription'
                }
            },
            { $unwind: { path: '$subscription', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    email: 1,
                    fullName: 1,
                    phone: 1,
                    address: 1,
                    verified: 1,
                    language: 1,
                    type: 1,
                    subscription: 1,
                    createdAt: 1
                }
            },
            {
                $facet: {
                    resultData: [
                        { $sort: { fullName: 1 } },
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

        return res.json(users);
    } catch (err) {
        console.error(strings.DB_ERROR, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};

export const deleteUsers = async (req, res) => {
    try {
        const ids = req.body.map(id => mongoose.Types.ObjectId(id));

        await User.deleteMany({ _id: { $in: ids } });
        return res.sendStatus(200);

    } catch (err) {
        console.error(`[user.delete]  ${strings.DB_ERROR} ${req.body}`, err);
        return res.status(400).send(strings.DB_ERROR + err);
    }
};
