import express from 'express'
import routeNames from '../config/paymentTypeRoutes.config.js'
import authJwt from '../middlewares/authJwt.js'
import * as paymentTypeController from '../controllers/paymentTypeController.js'

const routes = express.Router()

routes.route(routeNames.getPaymentTypes).get(authJwt.verifyToken, paymentTypeController.getPaymentTypes)
routes.route(routeNames.getEnabledPaymentTypes).get(paymentTypeController.getEnabledPaymentTypes)
routes.route(routeNames.updatePaymentTypes).put(authJwt.verifyToken, paymentTypeController.updatePaymentTypes)

export default routes