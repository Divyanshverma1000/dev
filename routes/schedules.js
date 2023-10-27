const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');

// Get the schedule for a specific day
router.get('/get-schedule-by-day/:day/:busDir', async (req, res) => {
  const day = req.params.day; // Get the day from the URL parameter
  const busDir = req.params.busDir;
  try {
    const schedule = await Schedule.findOne({ day, busDir });;
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found for the given day' });
    }
    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve schedule' });
  }
});




// Get the entire timetable
router.get('/get-entire-schedule', async (req, res) => {
  try {
    const entireSchedule = await Schedule.find(); // Retrieve all schedule entries
    if (entireSchedule.length === 0) {
      return res.status(404).json({ message: 'No schedules found' });
    }
    res.json(entireSchedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve the entire schedule' });
  }
});


// const express = require('express');
// const router = express.Router();
// const Schedule = require('./models/Schedule');

// Upload or update a schedule for a specific day
router.post('/upload-schedule', async (req, res) => {
  try {
    const { day, busDir,buses } = req.body; // Expecting day and buses data in the request body

    // Check if a schedule with the given day already exists
    let existingSchedule = await Schedule.findOne({ day, busDir });

    if (!existingSchedule) {
      // If no existing schedule is found, create a new one
      existingSchedule = new Schedule({ day,busDir ,buses });
    } else {
      // If an existing schedule is found, update it
      existingSchedule.buses = buses;
    }

    // Save the updated or new schedule to the database
    const updatedSchedule = await existingSchedule.save();

    res.status(200).json(updatedSchedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload/update schedule' });
  }
});
module.exports = router;

