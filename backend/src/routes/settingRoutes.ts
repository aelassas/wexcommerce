import express from 'express'
import routeNames from '../config/settingRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as settingController from '../controllers/settingController'

const routes = express.Router()

routes.route(routeNames.getLanguage).get(settingController.getLanguage)
routes.route(routeNames.getCurrency).get(settingController.getCurrency)
routes.route(routeNames.getStripeCurrency).get(settingController.getStripeCurrency)
routes.route(routeNames.getSettings).get(authJwt.verifyToken, settingController.getSettings)
routes.route(routeNames.updateSettings).put(authJwt.verifyToken, settingController.updateSettings)
routes.route(routeNames.updateBankSettings).put(authJwt.verifyToken, settingController.updateBankSettings)

export default routes
