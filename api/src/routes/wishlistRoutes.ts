import express from 'express'
import routeNames from '../config/wishlistRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as wishlistController from '../controllers/wishlistController'

const routes = express.Router()

routes.route(routeNames.addItem).post(authJwt.verifyToken, wishlistController.addItem)
routes.route(routeNames.deleteItem).delete(authJwt.verifyToken, wishlistController.deleteItem)
routes.route(routeNames.getWishlist).get(authJwt.verifyToken, wishlistController.getWishlist)
routes.route(routeNames.getWishlistCount).get(authJwt.verifyToken, wishlistController.getWishlistCount)
routes.route(routeNames.getWishlistId).get(authJwt.verifyToken, wishlistController.getWishlistId)
routes.route(routeNames.clearWishlist).delete(authJwt.verifyToken, wishlistController.clearWishlist)
routes.route(routeNames.update).put(authJwt.verifyToken, wishlistController.update)
routes.route(routeNames.check).get(authJwt.verifyToken, wishlistController.check)

export default routes
