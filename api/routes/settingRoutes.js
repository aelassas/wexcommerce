import express from 'express'
import routeNames from '../config/settingRoutes.config.js'
import authJwt from '../middlewares/authJwt.js'
import * as settingController from '../controllers/settingController.js'

const routes = express.Router()

routes.route(routeNames.getLanguage).get( settingController.getLanguage)
routes.route(routeNames.getCurrency).get(settingController.getCurrency)
routes.route(routeNames.getSettings).get(authJwt.verifyToken, settingController.getSettings)
routes.route(routeNames.updateSettings).put(authJwt.verifyToken, settingController.updateSettings)
routes.route(routeNames.updateBankSettings).put(authJwt.verifyToken, settingController.updateBankSettings)

export default routes