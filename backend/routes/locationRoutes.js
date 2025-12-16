const express = require('express');
const router = express.Router();
const { updateLocation, getLiveLocation, getRouteHistory, getVehicleRouteHistory } = require('../controllers/locationController');
const auth = require('../middleware/authMiddleware');

router.post('/update', auth(['driver']), updateLocation);
router.get('/live/:vehicleId', auth(['fleet_owner', 'admin']), getLiveLocation);
router.get('/history/:tripId', auth(['fleet_owner', 'admin']), getRouteHistory);
router.get('/history/vehicle/:vehicleId', auth(['fleet_owner', 'admin']), getVehicleRouteHistory);

module.exports = router;
