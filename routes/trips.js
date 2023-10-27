// routes/trips.js
const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const Trip = require('../models/Trip');
const User = require('../models/User');
const crypto = require('crypto');
router.post('/start-trip', async (req, res) => {
  try {
    // Extract user ID from the request (you can get the user ID from authentication)
    const {userId} = req.body; // Assuming you have user information available through authentication
    // const userIdObjectId = mongoose.Types.ObjectId(userId);
    // Check if the user has an ongoing trip
    const lastTrip = await Trip.findOne({ userId: userId, status: 'started' });

    if (lastTrip) {
      // User has an ongoing trip, prevent them from starting a new one
      return res.status(400).json({ error: 'You must end your last trip before starting a new one' });
    }

    // Create a new trip instance
    const newTrip = new Trip({
      userId,
      tripToken: generateUniqueTripToken(), // Generate a unique trip token
      startTime: new Date(),
      status: 'started', // Set the status to "started"
    });

    // Save the new trip to the database
    const savedTrip = await newTrip.save();

    // Return a success response
    res.status(201).json(savedTrip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Trip start failed' });
  }
});


// POST request to end an ongoing trip
router.post('/end-trip/:tripId', async (req, res) => {
  try {
    // Extract the trip ID from the request parameters
    const tripId = req.params.tripId;

    // Find the trip by ID
    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    trip.status='done';
    // Set the end time for the trip (assuming you pass it in the request body)
    trip.endTime=new Date();
    // UTC_Date = new Date();
    // const IST_Time = UTC_Date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    // trip.endTime = IST_Time;

    // Save the updated trip with the end time
    const updatedTrip = await trip.save();

    // Return a success response
    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Trip end failed' });
  }
});


// GET request to retrieve travel history for a user
router.get('/travel-history/:userId', async (req, res) => {
  try {
    // Extract the user ID from the request parameters
    const userId = req.params.userId;

    // Find all trips associated with the user
    const travelHistory = await Trip.find({ userId }).sort({ startTime: -1 });

    // Return the travel history as a JSON response
    res.status(200).json(travelHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve travel history' });
  }
});

// Other trip-related routes

module.exports = router;


function generateUniqueTripToken() {
  return crypto.randomBytes(20).toString('hex');
}

// const startTimeString = "22/10/2023, 6:38:18 pm";
// const endTimeString = "22/10/2023, 7:45:30 pm";

// const startTime = new Date(startTimeString);
// const endTime = new Date(endTimeString);
// const timeDifference = endTime - startTime; // This will give you the time difference in milliseconds
// const hours = Math.floor(timeDifference / (1000 * 60 * 60));
// const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
// const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

// console.log(`Time difference: ${hours} hours, ${minutes} minutes, ${seconds} seconds`);
