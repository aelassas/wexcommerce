import express from 'express';
import routeNames from "../config/stripeRoutes.config.js";
import * as stripeController from "../controllers/stripeController.js";
const routes = express.Router();
routes.route(routeNames.createCheckoutSession).post(stripeController.createCheckoutSession);
routes.route(routeNames.checkCheckoutSession).post(stripeController.checkCheckoutSession);
routes.route(routeNames.createPaymentIntent).post(stripeController.createPaymentIntent);
export default routes;