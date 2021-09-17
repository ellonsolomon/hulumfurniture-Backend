const Furniture = require('../models/furnitureModel');
const User = require('../models/userModel');
const Booking = require('../models/PurchasingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get furniture data from collection
  const furnitures = await Furniture.find();
  // 2) Build template

  // 3) Render that template using furniture from 1
  res.status(200).render('overview', {
    title: 'All Furnitures',
    furnitures,
  });
});

exports.getFurniture = catchAsync(async (req, res, next) => {
  // 1) Get the data, for requested furniture including reviews and guides
  const furniture = await await Furniture.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // console.log(furniture.reveiws);
  if (!furniture) {
    return next(new AppError('There is no furniture with that name.', 400));
  }
  // 2) Build template

  // 3) Render template using data from 1
  res.status(200).render('furniture', {
    title: `${furniture.name} Furniture`,
    furniture,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyFurnitures = catchAsync(async (req, res, next) => {
  // 1) Find all purchasings
  const purchasings = await Booking.find({ user: req.user.id });

  // 2) Find furnitures with the returned IDs
  const furnitureIDs = purchasings.map((el) => el.furniture);
  const furnitures = await Furniture.find({ _id: { $in: furnitureIDs } });

  res.status(200).render('overview', {
    title: 'My Furnitures',
    furnitures,
  });
});

exports.updateUserdata = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    { new: true, runValidators: true }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
