const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
// const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.use(viewsController.alerts);

router.get(
  '/',
  // bookingController.createBookingCheckout,
  
  // authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/furniture/:slug', authController.isLoggedIn, viewsController.getFurniture);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get(
  '/my-furnitures',
  // bookingController.createBookingCheckout,
  authController.protect,
  viewsController.getMyFurnitures
);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserdata
);
module.exports = router;
