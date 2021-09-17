//const fs = require('fs');
const express = require('express');
const furnitureController = require('../controllers/furnitureController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewControlles');

const reviewRouter = require('./reviewRoutes');

const router = express.Router();

const { test } = require('../controllers/testController');

router.route('/test').get(test);

router.use('/:furnitureId/reviews', reviewRouter);





router
  // .route('/furnitures-within/:distance/center/:latlng/unit/:unit')
  .route('/furnitures-nearMe')
  .get(furnitureController.getFurnituresWithin);


router
  .route('/')
  .get(furnitureController.getAllFurnitures)
  .post(
   
    authController.restrictTo('seller'),
    furnitureController.createFurniture
  );

router
  .route('/:id')
  .get(furnitureController.getFurniture)
  .patch(
    authController.protect,
    authController.restrictTo('seller'),
    furnitureController.uploadFurnitureImages,
    furnitureController.resizeFurnitureImages,
    furnitureController.updateFurniture
  )
  .delete(
    authController.protect,
    authController.restrictTo('seller'),
    furnitureController.deleteFurniture
  );

module.exports = router;
