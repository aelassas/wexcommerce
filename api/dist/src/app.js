import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import nocache from 'nocache';
import cookieParser from 'cookie-parser';
import i18n from "./lang/i18n.js";
import * as env from "./config/env.config.js";
import cors from "./middlewares/cors.js";
import allowedMethods from "./middlewares/allowedMethods.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import deliveryTypeRoutes from "./routes/deliveryTypeRoutes.js";
import paymentTypeRoutes from "./routes/paymentTypeRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";
import * as helper from "./common/helper.js";
const app = express();
app.use(helmet.contentSecurityPolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.crossOriginEmbedderPolicy());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
app.use(helmet.originAgentCluster());
app.use(helmet.crossOriginResourcePolicy({
  policy: 'cross-origin'
}));
app.use(helmet.crossOriginOpenerPolicy());
app.use(nocache());
app.use(compression({
  threshold: 0
}));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(express.json({
  limit: '50mb'
}));
app.use(cors());
app.options('*', cors());
app.use(cookieParser(env.COOKIE_SECRET));
app.use(allowedMethods);
app.use('/', userRoutes);
app.use('/', categoryRoutes);
app.use('/', productRoutes);
app.use('/', cartRoutes);
app.use('/', orderRoutes);
app.use('/', notificationRoutes);
app.use('/', deliveryTypeRoutes);
app.use('/', paymentTypeRoutes);
app.use('/', settingRoutes);
i18n.locale = env.DEFAULT_LANGUAGE;
helper.mkdir(env.CDN_USERS);
helper.mkdir(env.CDN_TEMP_USERS);
helper.mkdir(env.CDN_CATEGORIES);
helper.mkdir(env.CDN_TEMP_CATEGORIES);
helper.mkdir(env.CDN_PRODUCTS);
helper.mkdir(env.CDN_TEMP_PRODUCTS);
export default app;