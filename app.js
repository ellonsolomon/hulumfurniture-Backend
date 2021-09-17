const path = require('path');
const express = require('express');
const https = require('https');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');

const furnitureRouter = require('./routes/furnitureRoutes');

const reviewRouter = require('./routes/reviewRoutes');
const purchasingRouter = require('./routes/purchasingRoutes');
const purchasingController = require('./controllers/purchasingController');
// const furnitureRecommender = require('/controllers/RecommendationController'');
const app = express();

app.enable('trust proxy');




// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors({ origin: '*'}));

// app.options('*', cors());



// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


//  to be uncommented
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  purchasingController.webhookCheckout
);

// Body parser, reading data from body into req.body
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
// Data sanitization againist NoSQL query injection
app.use(mongoSanitize());
// Data sanitization againist XSS
app.use(xss());
// Prevent parameter polution




// app.use('/', furnitureRecommender);


app.use('/api/v1/furnitures', furnitureRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/purchasings', purchasingRouter);



app.use(globalErrorHandler);

// START SERVER

// const https = require('https');

/* 
https.get('https://api.ipregistry.co/?key=dfp1pvybudjgz1nu', (res) => {
  let payload = '';
  res.on('data', (data) => {
    payload += data;
  });
  res.on('end', () => {
    let userLocation = [];
    const ipRegisteryBody = JSON.parse(payload);
    userLocation =
      [ipRegisteryBody.location.latitude,
      ipRegisteryBody.location.longitude]
    console.log(userLocation)


  });
}); */

module.exports = app;
