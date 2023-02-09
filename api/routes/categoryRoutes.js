import express from 'express'
import routeNames from '../config/categoryRoutes.config.js'
import authJwt from '../middlewares/authJwt.js'
import * as categoryController from '../controllers/categoryController.js'

const routes = express.Router()

routes.route(routeNames.validate).post(authJwt.verifyToken, categoryController.validate)
routes.route(routeNames.checkCategory).get(authJwt.verifyToken, categoryController.checkCategory)
routes.route(routeNames.create).post(authJwt.verifyToken, categoryController.create)
routes.route(routeNames.update).put(authJwt.verifyToken, categoryController.update)
routes.route(routeNames.delete).delete(authJwt.verifyToken, categoryController.deleteCategory)
routes.route(routeNames.getCategory).get(authJwt.verifyToken, categoryController.getCategory)
routes.route(routeNames.getCategories).get(categoryController.getCategories)
routes.route(routeNames.searchCategories).get(authJwt.verifyToken, categoryController.searchCategories)

export default routes