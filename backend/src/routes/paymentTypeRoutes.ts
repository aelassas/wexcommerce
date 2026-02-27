import express from 'express'
import routeNames from '../config/paymentTypeRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as paymentTypeController from '../controllers/paymentTypeController'

const routes = express.Router()

routes.route(routeNames.getPaymentTypes).get(authJwt.verifyToken, authJwt.authAdmin, paymentTypeController.getPaymentTypes)
routes.route(routeNames.getEnabledPaymentTypes).get(paymentTypeController.getEnabledPaymentTypes)
routes.route(routeNames.updatePaymentTypes).put(authJwt.verifyToken, authJwt.authAdmin, paymentTypeController.updatePaymentTypes)

export default routes
