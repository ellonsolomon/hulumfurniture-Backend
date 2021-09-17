const express = require('express');
const purchasingController = require('../controllers/purchasingController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.use(authController.protect);

router.get(
  '/checkout-session/:furnitureId',
  purchasingController.getCheckoutSession
);

// router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(purchasingController.getAllPurchasings)
  .post(purchasingController.createPurchasing);

router
  .route('/:id')
  .get(purchasingController.getPurchasing)
  .patch(purchasingController.updatePurchasing)
  .delete(purchasingController.deletePurchasing);

module.exports = router;
