import express from 'express'
import routeNames from '../config/deliveryTypeRoutes.config.js'
import authJwt from '../middlewares/authJwt.js'
import * as deliveryTypeController from '../controllers/deliveryTypeController.js'

const routes = express.Router()

routes.route(routeNames.getDeliveryTypes).get(authJwt.verifyToken, deliveryTypeController.getDeliveryTypes)
routes.route(routeNames.getEnabledDeliveryTypes).get(deliveryTypeController.getEnabledDeliveryTypes)
routes.route(routeNames.updateDeliveryTypes).put(authJwt.verifyToken, deliveryTypeController.updateDeliveryTypes)

export default routes