const mongoose = require('mongoose');

const purchasingSchema = new mongoose.Schema({
  furniture: {
    type: mongoose.Schema.ObjectId,
    ref: 'Furniture',
    
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
   
  },
  price: {
    type: Number,
    require: [true, 'Purchasing must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

purchasingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'furniture',
    select: 'name',
  });
  next();
});

const Purchasing = mongoose.model('Purchasing', purchasingSchema);

module.exports = Purchasing;
