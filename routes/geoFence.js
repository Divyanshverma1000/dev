const express = require('express');
const router = express.Router();
router.use(express.json());

// Define the center and radius of your geofence
const geofence = {
  lat: 30.9689222,
  lon: 76.4655361,
  radius: 1, // in kilometers
//   "userLat":30.9689222,
//   "userLon":76.4655361
//sample data 
// {
//     "userLat":30.9689222,
//      "userLon": 76.465536
//    }
};

router.post('/check-geofence', (req, res) => {
  const { userLat, userLon } = req.body;

  const R = 6371; // Earth's radius in kilometers

  const lat1 = toRadians(userLat);
  const lon1 = toRadians(userLon);
  const lat2 = toRadians(geofence.lat);
  const lon2 = toRadians(geofence.lon);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  if (distance <= geofence.radius) {
    res.json({ withinGeofence: true ,distance});
  } else {
    res.json({ withinGeofence: false ,distance});
  }
});

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

module.exports = router;
