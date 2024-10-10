import express from 'express'
import routeNames from '../config/wishListRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as wishlistController from '../controllers/wishlistController'

const routes = express.Router()

routes.route(routeNames.addItem).post(wishlistController.addItem)
routes.route(routeNames.deleteItem).delete(wishlistController.deleteItem)
routes.route(routeNames.getWishlist).get(wishlistController.getWishlist)
routes.route(routeNames.getWishlistCount).get(wishlistController.getWishlistCount)
routes.route(routeNames.getWishlistId).get(authJwt.verifyToken, wishlistController.getWishlistId)
routes.route(routeNames.clearWishlist).delete(wishlistController.clearWishlist)

export default routes
