const mongoose = require('mongoose');
const Furniture = require('./furnitureModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    furniture: {
      type: mongoose.Schema.ObjectId,
      ref: 'Furniture',
      required: [true, 'Review must belong to a furniture.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],

      // user: {
      //   type: mongoose.Schema.ObjectId,
      //   ref: 'User',
      //   required: [true, 'Review must belong to user'],
      // },

      // furniture: {
      //   type: mongoose.Schema.ObjectId,
      //   ref: 'furniture',
      //   required: [true, 'Review must belong to a furniture'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ furniture: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  /* this.populate({
    path: 'furniture',
    select: 'name',
  }).populate({
    path: 'user',
    select: 'name photo',
  }); */
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (furnitureId) {
  const stats = await this.aggregate([
    {
      $match: { furniture: furnitureId },
    },
    {
      $group: {
        _id: '$furniture',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Furniture.findByIdAndUpdate(furnitureId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Furniture.findByIdAndUpdate(furnitureId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.furniture);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); doesn't work here, query already excuted
  await this.r.constructor.calcAverageRatings(this.r.furniture);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
