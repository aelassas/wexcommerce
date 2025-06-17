import express from 'express'
import routeNames from '../config/orderRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as orderController from '../controllers/orderController'

const routes = express.Router()

routes.route(routeNames.checkout).post(orderController.checkout)
routes.route(routeNames.update).put(authJwt.verifyToken, orderController.update)
routes.route(routeNames.delete).delete(authJwt.verifyToken, orderController.deleteOrder)
routes.route(routeNames.deleteTempOrder).delete(orderController.deleteTempOrder)
routes.route(routeNames.getOrder).get(authJwt.verifyToken, orderController.getOrder)
routes.route(routeNames.getOrders).post(authJwt.verifyToken, orderController.getOrders)

export default routes
