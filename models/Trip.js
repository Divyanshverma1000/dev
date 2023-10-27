// models/Trip.js
const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference the User model
  },
  tripToken: String,
  startTime: String,
  endTime:String,
  status:String,
  // Add other fields as needed
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
