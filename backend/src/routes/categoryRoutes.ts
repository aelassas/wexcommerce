import express from 'express'
import multer from 'multer'
import routeNames from '../config/categoryRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as categoryController from '../controllers/categoryController'

const routes = express.Router()

routes.route(routeNames.validate).post(authJwt.verifyToken, authJwt.authAdmin, categoryController.validate)
routes.route(routeNames.checkCategory).get(authJwt.verifyToken, authJwt.authAdmin, categoryController.checkCategory)
routes.route(routeNames.create).post(authJwt.verifyToken, authJwt.authAdmin, categoryController.create)
routes.route(routeNames.update).put(authJwt.verifyToken, authJwt.authAdmin, categoryController.update)
routes.route(routeNames.delete).delete(authJwt.verifyToken, authJwt.authAdmin, categoryController.deleteCategory)
routes.route(routeNames.getCategory).get(authJwt.verifyToken, authJwt.authAdmin, categoryController.getCategory)
routes.route(routeNames.getCategories).get(categoryController.getCategories)
routes.route(routeNames.getFeaturedCategories).get(categoryController.getFeaturedCategories)
routes.route(routeNames.searchCategories).get(authJwt.verifyToken, authJwt.authAdmin, categoryController.searchCategories)
routes.route(routeNames.createImage).post([authJwt.verifyToken, authJwt.authAdmin, multer({ storage: multer.memoryStorage() }).single('image')], categoryController.createImage)
routes.route(routeNames.updateImage).post([authJwt.verifyToken, authJwt.authAdmin, multer({ storage: multer.memoryStorage() }).single('image')], categoryController.updateImage)
routes.route(routeNames.deleteImage).post(authJwt.verifyToken, authJwt.authAdmin, categoryController.deleteImage)
routes.route(routeNames.deleteTempImage).post(authJwt.verifyToken, authJwt.authAdmin, categoryController.deleteTempImage)

export default routes
