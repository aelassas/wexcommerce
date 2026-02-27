import express from 'express'
import multer from 'multer'
import routeNames from '../config/productRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as productController from '../controllers/productController'

const routes = express.Router()

routes.route(routeNames.uploadImage).post([authJwt.verifyToken, authJwt.authAdmin, multer({ storage: multer.memoryStorage() }).single('image')], productController.uploadImage)
routes.route(routeNames.deleteTempImage).post(authJwt.verifyToken, authJwt.authAdmin, productController.deleteTempImage)
routes.route(routeNames.deleteImage).post(authJwt.verifyToken, authJwt.authAdmin, productController.deleteImage)
routes.route(routeNames.create).post(authJwt.verifyToken, authJwt.authAdmin, productController.create)
routes.route(routeNames.update).put(authJwt.verifyToken, authJwt.authAdmin, productController.update)
routes.route(routeNames.checkProduct).get(authJwt.verifyToken, authJwt.authAdmin, productController.checkProduct)
routes.route(routeNames.delete).delete(authJwt.verifyToken, authJwt.authAdmin, productController.deleteProduct)
routes.route(routeNames.getProduct).post(productController.getProduct)
routes.route(routeNames.getAdminProducts).post(authJwt.verifyToken, authJwt.authAdmin, productController.getAdminProducts)
routes.route(routeNames.getFrontendProducts).post(productController.getFrontendProducts)
routes.route(routeNames.getFeaturedProducts).post(productController.getFeaturedProducts)

export default routes
