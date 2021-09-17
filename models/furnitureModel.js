const mongoose = require('mongoose');
const slugify = require('slugify');
// const Review = require('./reviewModel');

// const User = require('./userModel');
//const validator = require('validator');

const furnitureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A furniture must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A furniture name must have less than or equal to 40 characters',
      ],
      minlength: [
        10,
        'A furniture name must have more than or equal to 10 characters',
      ],
      // validate: [validator.isAlpha, 'Furniture name must only be letter']
    },
    slug: String,

    type: {
      type: String,
      required: [true, 'A furniture must have a purpose'],
      enum: {
        values: ['Brand New', 'Like New'],
        message: 'Type is either: brand new, like new',
      },
    },
    purpose: {
      type: String,
      required: [true, 'A furniture must have a purpose'],
      enum: {
        values: ['Office', 'Home', 'School', 'Hospital'],
        message: 'Purpose is either: office, home, school, hospital',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A furniture must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price {VALUE} should be below regular price',
      },
    },

    summary: {
      type: String,
      trim: true,
    },
    /*  imageCover: {
      type: String,
      required: [true, 'A furniture must have a cover image'],
    }, */
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    location:
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        day: Number,
      },
    
    // guides: Array,
    seller: 
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    
  },
  {
    toJSON: { virtuals: true },
    // toObject: { virtuals: true },
  }
);

furnitureSchema.index({ name: "text", description: "text"  });
furnitureSchema.index({ price: 1, ratingsAverage: -1 });
furnitureSchema.index({ slug: 1 });
furnitureSchema.index({ location: '2dsphere' });

// Virtual populate
furnitureSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'furniture',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
furnitureSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// furnitureSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// furnitureSchema.pre('save', function(next) {
//   console.log('will save document...');
//   next();
// });
// furnitureSchema.post('save', function(doc, next){
//   console.log(doc);
//   next();
// })

/* 
furnitureSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
}); */

// furnitureSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'reviews',
//     //select: '-__v -passwordChangedAt',
//   });
//   next();
// });

const Furniture = mongoose.model('Furniture', furnitureSchema);

module.exports = Furniture;
