import express from 'express'
import routeNames from '../config/cartRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as cartController from '../controllers/cartController'

const routes = express.Router()

routes.route(routeNames.addItem).post(cartController.addItem)
routes.route(routeNames.updateItem).put(cartController.updateItem)
routes.route(routeNames.deleteItem).delete(cartController.deleteItem)
routes.route(routeNames.delete).delete(cartController.deleteCart)
routes.route(routeNames.getCart).get(cartController.getCart)
routes.route(routeNames.getCartCount).get(cartController.getCartCount)
routes.route(routeNames.getCartId).get(authJwt.verifyToken, cartController.getCartId)
routes.route(routeNames.update).put(authJwt.verifyToken, cartController.update)
routes.route(routeNames.clearOtherCarts).delete(authJwt.verifyToken, cartController.clearOtherCarts)

export default routes
