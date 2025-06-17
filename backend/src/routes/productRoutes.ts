import express from 'express'
import multer from 'multer'
import routeNames from '../config/productRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as productController from '../controllers/productController'

const routes = express.Router()

routes.route(routeNames.uploadImage).post([authJwt.verifyToken, multer({ storage: multer.memoryStorage() }).single('image')], productController.uploadImage)
routes.route(routeNames.deleteTempImage).post(authJwt.verifyToken, productController.deleteTempImage)
routes.route(routeNames.deleteImage).post(authJwt.verifyToken, productController.deleteImage)
routes.route(routeNames.create).post(authJwt.verifyToken, productController.create)
routes.route(routeNames.update).put(authJwt.verifyToken, productController.update)
routes.route(routeNames.checkProduct).get(authJwt.verifyToken, productController.checkProduct)
routes.route(routeNames.delete).delete(authJwt.verifyToken, productController.deleteProduct)
routes.route(routeNames.getProduct).post(productController.getProduct)
routes.route(routeNames.getAdminProducts).post(authJwt.verifyToken, productController.getAdminProducts)
routes.route(routeNames.getFrontendProducts).post(productController.getFrontendProducts)
routes.route(routeNames.getFeaturedProducts).post(productController.getFeaturedProducts)

export default routes
