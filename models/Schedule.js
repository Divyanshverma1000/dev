const mongoose = require('mongoose');

// Schema for bus schedules
const scheduleSchema = new mongoose.Schema({
  day: String,
  busDir:String, 
  buses: [
    {  busId:String,
      departureTime: String,
      route: String,
      // Add more schedule-related fields
    },
  ],
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
