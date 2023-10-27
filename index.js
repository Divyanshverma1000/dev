const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
require('dotenv').config();
const mongoose = require('mongoose');
const session = require('express-session');
const {readdirSync} = require('fs');
const fs = require('fs');
 
const path = require('path');
const apiKeyValidation = require('./routes/apikeyValidation');
require('./config');


const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));


app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views')); // Specify the views directory

app.use(
  session({
    secret: process.env.SECRET_KEY, // Replace with a strong, random key
    resave: false,
    saveUninitialized: true,
  })
);


// Initialize and use Passport.js
const passport = require('passport');
// Other Passport.js configuration

app.use(passport.initialize());
app.use(passport.session());


const connectionString = process.env.CONNECTION_STRING;
const secretKey = process.env.SECRET_KEY;
const apiKey = process.env.API_KEY;
const emailPassword = process.env.GMAIL_PASS;
mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  }).then(() => {
    console.log('Connected to MongoDB Atlas');
  }).catch((err) => {
    console.error('Failed to connect to MongoDB Atlas:', err);
    process.exit(1); // Exit the process on database connection failure
  });



// Import your   modules
const tripsRoutes = require('./routes/trips');
const schedulesRoutes = require('./routes/schedules');
const authRoutes = require('./routes/auth');
const geoFenceRoutes = require('./routes/geoFence');
const verificationRoutes = require('./routes/emailVerification');


// readdirSync('./routes').forEach((file) => {
//     const route = require(`./routes/${file}`);
//     app.use('/', route);
//   });
  
//   app.get('/', (req, res) => {
//     res.send('main page');
//   });
// Define routes using imported modules
app.use('/trips', tripsRoutes,apiKeyValidation);
app.use('/schedules', schedulesRoutes,apiKeyValidation);
app.use('/auth', authRoutes);
app.use('/geoFence', geoFenceRoutes,apiKeyValidation);
app.use('/emailVerification', verificationRoutes, apiKeyValidation);

// console.log();

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




