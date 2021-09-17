const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Purchasing = require('../models/PurchasingModel');
const Furniture = require('../models/furnitureModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
// const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently purchased furniture
  const furniture = await Furniture.findById(req.params.furnitureId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/my-furnitures/?furniture=${
    //   req.params.furnitureId
    // }&user=${req.user.id}&price=${furniture.price}`,
    success_url: `${req.protocol}://${req.get(
      'host'
    )}/my-furnitures?alert=Purchasing`,
    cancel_url: `${req.protocol}://${req.get('host')}/furniture/${
      furniture.slug
    }`,
    customer_email: req.user.email,
    client_reference_id: req.params.furnitureId,
    line_items: [
      {
        name: `${furniture.name} Furniture`,
        description: furniture.summary,
        // images: [`https://www.nafurnitures.dev/img/furnitures/${furniture.imageCover}`],
        images: [
          `${req.protocol}://${req.get('host')}/img/furnitures/${
            furniture.imageCover
          }`,
        ],
        amount: furniture.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });
  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createPurchasingCheckout = catchAsync(async (req, res, next) => {
//   // This is only temporary, because it's unsecure: everyone can make Purchasings without paying
//   const { furniture, user, price } = req.query;

//   if (!furniture && !user && !price) return next();
//   await Purchasing.create({ furniture, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createPurchasingCheckout = async (session) => {
  const furniture = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.display_items[0].amount / 100;
  await Purchasing.create({ furniture, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createPurchasingCheckout(event.data.object);

  res.status(200).json({ received: true });
};

exports.createPurchasing= factory.createOne(Purchasing);
exports.getPurchasing= factory.getOne(Purchasing);
exports.getAllPurchasings = factory.getAll(Purchasing);
exports.updatePurchasing= factory.updateOne(Purchasing);
exports.deletePurchasing= factory.deleteOne(Purchasing);
