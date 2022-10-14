import express from 'express';
import routeNames from '../config/cartRoutes.config.js';
import authJwt from '../middlewares/authJwt.js';
import * as cartController from '../controllers/cartController.js';

const routes = express.Router();

routes.route(routeNames.addItem).post(cartController.addItem);
routes.route(routeNames.updateItem).put(cartController.updateItem);
routes.route(routeNames.deleteItem).delete(cartController.deleteItem);
routes.route(routeNames.delete).delete(authJwt.verifyToken, cartController.deleteCart);
routes.route(routeNames.getCart).get(authJwt.verifyToken, cartController.getCart);

export default routes;