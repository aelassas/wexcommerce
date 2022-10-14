import express from 'express';
import routeNames from '../config/subscriptionRoutes.config.js';
import authJwt from '../middlewares/authJwt.js';
import * as subscriptionController from '../controllers/subscriptionController.js';

const routes = express.Router();

routes.route(routeNames.validate).post(authJwt.verifyToken, subscriptionController.validate);
routes.route(routeNames.validateVideosPerMonth).get(authJwt.verifyToken, subscriptionController.validateVideosPerMonth);
routes.route(routeNames.checkSubscription).get(authJwt.verifyToken, subscriptionController.checkSubscription);
routes.route(routeNames.create).post(authJwt.verifyToken, subscriptionController.create);
routes.route(routeNames.update).put(authJwt.verifyToken, subscriptionController.update);
routes.route(routeNames.delete).delete(authJwt.verifyToken, subscriptionController.deleteSubscription);
routes.route(routeNames.getSubscription).get(authJwt.verifyToken, subscriptionController.getSubscription);
routes.route(routeNames.getSubscriptions).get(subscriptionController.getSubscriptions);
routes.route(routeNames.subscribe).post(subscriptionController.subscribe);

export default routes;