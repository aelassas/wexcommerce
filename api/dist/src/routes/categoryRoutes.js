import express from 'express';
import multer from 'multer';
import routeNames from "../config/categoryRoutes.config.js";
import authJwt from "../middlewares/authJwt.js";
import * as categoryController from "../controllers/categoryController.js";
const routes = express.Router();
routes.route(routeNames.validate).post(authJwt.verifyToken, categoryController.validate);
routes.route(routeNames.checkCategory).get(authJwt.verifyToken, categoryController.checkCategory);
routes.route(routeNames.create).post(authJwt.verifyToken, categoryController.create);
routes.route(routeNames.update).put(authJwt.verifyToken, categoryController.update);
routes.route(routeNames.delete).delete(authJwt.verifyToken, categoryController.deleteCategory);
routes.route(routeNames.getCategory).get(authJwt.verifyToken, categoryController.getCategory);
routes.route(routeNames.getCategories).get(categoryController.getCategories);
routes.route(routeNames.searchCategories).get(authJwt.verifyToken, categoryController.searchCategories);
routes.route(routeNames.createImage).post([authJwt.verifyToken, multer({
  storage: multer.memoryStorage()
}).single('image')], categoryController.createImage);
routes.route(routeNames.updateImage).post([authJwt.verifyToken, multer({
  storage: multer.memoryStorage()
}).single('image')], categoryController.updateImage);
routes.route(routeNames.deleteImage).post(authJwt.verifyToken, categoryController.deleteImage);
routes.route(routeNames.deleteTempImage).post(authJwt.verifyToken, categoryController.deleteTempImage);
export default routes;