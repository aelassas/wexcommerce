import express from 'express';
import routeNames from '../config/orderRoutes.config.js';
import authJwt from '../middlewares/authJwt.js';
import * as orderController from '../controllers/orderController.js';

const routes = express.Router();

routes.route(routeNames.create).post(orderController.create);
routes.route(routeNames.update).put(authJwt.verifyToken, orderController.update);
routes.route(routeNames.delete).delete(authJwt.verifyToken, orderController.deleteOrder);
routes.route(routeNames.getOrder).get(authJwt.verifyToken, orderController.getOrder);
routes.route(routeNames.getOrders).get(authJwt.verifyToken, orderController.getOrders);

export default routes;