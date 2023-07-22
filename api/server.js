import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import compression from 'compression'
import helmet from 'helmet'
import nocache from 'nocache'
import strings from './config/app.config.js'
import userRoutes from './routes/userRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import deliveryTypeRoutes from './routes/deliveryTypeRoutes.js'
import paymentTypeRoutes from './routes/paymentTypeRoutes.js'
import settingRoutes from './routes/settingRoutes.js'
import * as deliveryTypeController from './controllers/deliveryTypeController.js'
import * as paymentTypeController from './controllers/paymentTypeController.js'
import * as settingController from './controllers/settingController.js'

const DB_HOST = process.env.WC_DB_HOST
const DB_PORT = process.env.WC_DB_PORT
const DB_SSL = process.env.WC_DB_SSL.toLowerCase() === 'true'
const DB_SSL_KEY = process.env.WC_DB_SSL_KEY
const DB_SSL_CERT = process.env.WC_DB_SSL_CERT
const DB_SSL_CA = process.env.WC_DB_SSL_CA
const DB_DEBUG = process.env.WC_DB_DEBUG.toLowerCase() === 'true'
const DB_AUTH_SOURCE = process.env.WC_DB_AUTH_SOURCE
const DB_USERNAME = process.env.WC_DB_USERNAME
const DB_PASSWORD = process.env.WC_DB_PASSWORD
const DB_APP_NAME = process.env.WC_DB_APP_NAME
const DB_NAME = process.env.WC_DB_NAME
const DB_URI = `mongodb://${encodeURIComponent(DB_USERNAME)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=${DB_AUTH_SOURCE}&appName=${DB_APP_NAME}`

const init = async () => {
    let done = await deliveryTypeController.init()
    done &= await paymentTypeController.init()
    done &= await settingController.init()

    if (done) {
        console.log('Initialization succeeded')
    } else {
        console.log('Initialization failed')
    }
}

let options = {}
if (DB_SSL) {
    options = {
        ssl: true,
        sslValidate: true,
        sslKey: DB_SSL_KEY,
        sslCert: DB_SSL_CERT,
        sslCA: [DB_SSL_CA]
    }
}

mongoose.set('debug', DB_DEBUG)
mongoose.set('strictQuery', true)
mongoose.Promise = global.Promise
mongoose.connect(DB_URI, options)
    .then(
        async () => {
            console.log('Database is connected')
            await init()
        },
        (err) => {
            console.error('Cannot connect to the database:', err)
        }
    )

const app = express()
app.use(helmet.contentSecurityPolicy())
app.use(helmet.dnsPrefetchControl())
app.use(helmet.crossOriginEmbedderPolicy())
app.use(helmet.frameguard())
app.use(helmet.hidePoweredBy())
app.use(helmet.hsts())
app.use(helmet.ieNoOpen())
app.use(helmet.noSniff())
app.use(helmet.permittedCrossDomainPolicies())
app.use(helmet.referrerPolicy())
app.use(helmet.xssFilter())
app.use(helmet.originAgentCluster())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use(helmet.crossOriginOpenerPolicy())
app.use(nocache())
app.use(compression({ threshold: 0 }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.json({ limit: '50mb' }))
app.use(cors())
app.use('/', userRoutes)
app.use('/', categoryRoutes)
app.use('/', productRoutes)
app.use('/', cartRoutes)
app.use('/', orderRoutes)
app.use('/', notificationRoutes)
app.use('/', deliveryTypeRoutes)
app.use('/', paymentTypeRoutes)
app.use('/', settingRoutes)

strings.setLanguage(process.env.WC_DEFAULT_LANGUAGE)

export default app