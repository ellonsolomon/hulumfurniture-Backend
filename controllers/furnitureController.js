// const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
// const APIFeatures = require('../utils/apiFeatures');
const Furniture = require('../models/furnitureModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadFurnitureImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeFurnitureImages = catchAsync(async (req, res, next) => {
  // console.log()
  if (!req.files.imageCover || !req.files.images) return next();
  // 1) Cover image
  req.body.imageCover = `furniture-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/furnitures/${req.body.imageCover}`);
  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `furniture-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/furnitures/${filename}`);

      req.body.images.push(filename);
    })
  );
  next();
});


exports.getAllFurnitures = factory.getAll(Furniture);
exports.getFurniture = factory.getOne(Furniture, { path: 'reviews' });
exports.createFurniture = factory.createOne(Furniture);
exports.updateFurniture = factory.updateOne(Furniture);
exports.deleteFurniture = factory.deleteOne(Furniture);

/* exports.getFurnitureStats = catchAsync(async (req, res, next) => {
  const stats = await Furniture.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        //_id: '$ratingsAverage',
        _id: { $toUpper: '$difficulty' },
        numFurnitures: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    {
      $sort: { avgPrice: 1 },
    },

    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]); 
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
}); */
exports.getSeachedFurnitures = catchAsync(async (req, res, next) => {
  const text = req.body.insertedText;
  text.toString();

  const furnitures = await Furniture.find({ $text:
    { $search: text }});
  res.status(200).json({
    status: 'success',
    results: furnitures.length,
    data: {
      data: furnitures,
    },
  });
});

exports.getFurnituresWithin = catchAsync(async (req, res, next) => {
  const latlng = req.body.userLocation;
  console.log(latlng);
  latlng.toString()
  const [lat, lng] = latlng.split(',');

  // const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  // const radius = 0.0062714602;
  const radius = 5000 / 6378.1;

  // distance (40 kilometers in our case)/ 6378.1;

  const furnitures = await Furniture.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: furnitures.length,
    data: {
      data: furnitures,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longtude in the format lat,lng',
        400
      )
    );
  }

  const distances = await Furniture.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
